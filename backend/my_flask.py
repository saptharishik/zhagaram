from flask import Flask, jsonify, request, render_template, Response, session, redirect
import cv2
from ultralytics import YOLO
# from PushingBox import PushingBox
# from video_detection import video_detectionp,video_detectiond
import firebase_admin
from firebase_admin import credentials, db
import time
import datetime
# cv2.VideoCapture.set(cv2.CAP_PROP_BACKEND, cv2.CAP_DSHOW)
import requests

l=[]
def sms_send(msg):
 
    apiSecret = "65d81aec325297c4e9f71699ad3f6af05774deb9"
    message = {
        "secret": apiSecret,
        "mode": "devices",
        "device": "00000000-0000-0000-62c9-e04b41c7fe89",
        "sim": 1,
        "priority": 1,
        "phone": "+918610957277",
        "message": msg
    }
    r = requests.post(url = "https://www.cloud.smschef.com/api/send/sms", params = message)

prev = ""
def video_detectiond(path_x,port):
    # Load the YOLOv8 model
    model = YOLO("disease.pt")
    prev=""
    video_path = 0
    cap = cv2.VideoCapture(path_x)

    # Loop through the video fram   es
    while cap.isOpened():
        # Read a frame from the video
        success, frame = cap.read()
        
        if success:
            # Run YOLOv8 inference on the frame
            results = model.predict(frame,verbose=False,conf=0.75)

            # Visualize the results on the frame
            annotated_frame = results[0].plot()

            if len(results[0]) > 0:
                # sms_fun()
                for result in results:
                    if result.boxes:
                        box = result.boxes[0]
                        class_id = int(box.cls)
                        object_name = model.names[class_id]
                        print(object_name)
                        if object_name=="Diseased":
                            if prev!=object_name:
                                sms_send("Disease_Detected")
                            prev=object_name
                            
                            root_ref.child('Safety').update({'d_flag':1})
                            current_time = datetime.datetime.now().time()

                            # Format and print the current time
                            formatted_time = current_time.strftime("%H:%M:%S")
                            # print("Current time: " + formatted_time)
                            l.append({"type":"disease","camera":port,"time":formatted_time})
                            add_data_to_firebase("disease",port)
                            # for i in l:
                            #     print(i)
                        else:
                             root_ref.child('Safety').update({'d_flag':0})

                            
            else:
                root_ref.child('Safety').update({'d_flag':0})

            # Display the annotated frame
            # cv2.imshow("YOLOv8 Inference", annotated_frame)
            yield annotated_frame
            # Break the loop if 'q' is pressed
            
        

def add_data_to_firebase(detection_type, camera_port):
    current_time = datetime.datetime.now().time()
    formatted_time = current_time.strftime("%H:%M:%S")

    data = {
        camera_port : formatted_time
    }

    if detection_type == "pest":
        # Set data at the 'pest' node in Firebase
        pest_ref = root_ref.child('Safety/pest')
        pest_ref.set(data)
        # Update the flag for pest detection
        root_ref.child('Safety').update({'flag': 1})
    elif detection_type == "disease":
        # Set data at the 'disease' node in Firebase
        disease_ref = root_ref.child('Safety/disease')
        disease_ref.set(data)
        # Update the flag for disease detection
        root_ref.child('Safety').update({'d_flag': 1})
def video_detectionp(path_x,port):
    
    
    # Load the YOLOv8 model
    model = YOLO("pest.pt")

    video_path = 0
    cap = cv2.VideoCapture(path_x)

    # Loop through the video fram   es
    while cap.isOpened():
        # Read a frame from the video
        success, frame = cap.read()

        if success:
            # Run YOLOv8 inference on the frame
            results = model.predict(frame,verbose=False,conf=0.75)
            
            # Visualize the results on the frame
            annotated_frame = results[0].plot()
            if len(results[0]) > 0:
                # pbox.push('vA2C636832AD8A38')

                for result in results:
                    if result.boxes:
                        box = result.boxes[0]
                        class_id = int(box.cls)
                        object_name = model.names[class_id]
                        print(object_name)
                        root_ref.child('Safety').update({'flag':1})
                        current_time = datetime.datetime.now().time()

                        # Format and print the current time
                        formatted_time = current_time.strftime("%H:%M:%S")
                        # print("Current time: " + formatted_time)
                        l.append({"type":"pest","camera":port,"time":formatted_time})
                        add_data_to_firebase("pest",port)

                        # for i in l:
                        #     print(i)
            else:
                root_ref.child('Safety').update({'flag':0})


                        
            # Display the annotated frame
            # cv2.imshow("YOLOv8 Inference", annotated_frame)
            yield annotated_frame
            # Break the loop if 'q' is pressed
            

    # Release the video capture object and close the display window
    cap.release()
    cv2.destroyAllWindows()
# Initialize Firebase Admin SDK with your service account credentials
cred = credentials.Certificate("database.json")
firebase_admin.initialize_app(cred, {"databaseURL": "https://zhagaram-99dd9-default-rtdb.firebaseio.com/"})

# Get a reference to the root of the database
root_ref = db.reference('/') 
data = root_ref.get()
current_temperature = data['Safety']['temperature']
sprinkler = data['Safety']['counter']
co_level=data['Safety']['CO']
disflag = data['Safety']['d_flag']
pestflag = data['Safety']['flag']

co_level="{:.2f}".format(int(co_level * 100) / 100)

print(disflag,pestflag)

if disflag == pestflag and disflag==0:
    root_ref.child('Safety').update({'condition':"SAFE"})
else:
    root_ref.child('Safety').update({'condition':"UNSAFE"})

conditi = data['Safety']['condition']
motor = data['Safety']['motor_on']
motor_status =""
if motor==1:
    motor_status="ON"
else:
    motor_status="OFF"




app = Flask(__name__, static_url_path='/static', static_folder='static')

app.config['SECRET_KEY'] = "rishi"
def generate_framesp(path_x="",port=""):
    yolo_output = video_detectionp(path_x,port)
    
    

    
    for dec in yolo_output:
        ref, buffer = cv2.imencode('.jpg', dec)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

def generate_framesd(path_x="",port=""):
    yolo_output = video_detectiond(path_x,port)
    
    
    for dec in yolo_output:
        ref, buffer = cv2.imencode('.jpg', dec)
        frame = buffer.tobytes()
        yield (b'--frame\r\n'
               b'content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
@app.route('/', methods=['GET', 'POST'])
@app.route('/home', methods=['GET', 'POST'])
def home():
    
    return render_template('index.html', current_temperature=current_temperature,sprinkler=sprinkler,conditi=conditi,motor_status=motor_status,co_level=co_level)


@app.route('/pest',methods=['GET','POST'])
def pest():
    return render_template('pestcam.html')


    # return Response(generate_framesp(path_x=0), mimetype='multipart/x-mixed-replace; boundary=frame')
# pestcam = "https://192.168.1.16:8080/video"
pestcam = 0
@app.route('/pcam1',methods=['GET','POST'])
def pc1():
    return Response(generate_framesp(path_x=pestcam,port="pcam1"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/pcam2',methods=['GET','POST'])
def pc2():
    return Response(generate_framesp(path_x=pestcam,port="pcam2"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/pcam3',methods=['GET','POST'])
def pc3():
    return Response(generate_framesp(path_x=pestcam,port="pcam3"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/pcam4',methods=['GET','POST'])
def pc4():
    return Response(generate_framesp(path_x=pestcam,port="pcam4"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/pcam5',methods=['GET','POST'])
def pc5():
    return Response(generate_framesp(path_x=pestcam,port="pcam5"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/pcam6',methods=['GET','POST'])
def pc6():
    return Response(generate_framesp(path_x=pestcam,port="pcam6"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/disease',methods=['GET','POST'])

def disease():
    # return Response(generate_framesd(path_x=0), mimetype='multipart/x-mixed-replace; boundary=frame')
    return render_template('diseasecam.html')
# discam = "https://192.168.1.15:8080/video"
discam = 0
@app.route('/dcam1',methods=['GET','POST'])
def dc1():
    return Response(generate_framesd(path_x=discam,port="dcam1"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam2',methods=['GET','POST'])
def dc2():
    return Response(generate_framesd(path_x=discam,port="dcam2"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam3',methods=['GET','POST'])
def dc3():
    return Response(generate_framesd(path_x=discam,port="dcam3"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam4',methods=['GET','POST'])
def dc4():
    return Response(generate_framesd(path_x=discam,port="dcam4"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam5',methods=['GET','POST'])
def dc5():
    return Response(generate_framesd(path_x=discam,port="dcam5"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam6',methods=['GET','POST'])
def dc6():
    return Response(generate_framesd(path_x=discam,port="dcam6"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam7',methods=['GET','POST'])
def dc7():
    return Response(generate_framesd(path_x=discam,port="dcam7"), mimetype='multipart/x-mixed-replace; boundary=frame')
@app.route('/dcam8',methods=['GET','POST'])
def dc8():
    return Response(generate_framesd(path_x=discam,port="dcam8"), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/sprinkler',methods=['GET','POST'])
def sprinkl():
    root_ref.child('Safety').update({'motor_on':1})
    return redirect('/')


@app.route('/get_values', methods=['POST'])
@app.route('/get_values', methods=['POST'])
def get_values():
    # Fetch the latest data from Firebase
    data = root_ref.get()
    
    global current_temperature, sprinkler, conditi, motor_status
    current_temperature = data['Safety']['temperature']
    sprinkler = data['Safety']['counter']
    conditi = data['Safety']['condition']
    motor = data['Safety']['motor_on']
    
    
    # Determine motor status
    if motor == 1:
        motor_status = "ON"
    else:
        motor_status = "OFF"
    disflag = data['Safety']['d_flag']
    pestflag = data['Safety']['flag']

    if disflag == pestflag and disflag==0:
        root_ref.child('Safety').update({'condition':"SAFE"})
    else:
        root_ref.child('Safety').update({'condition':"UNSAFE"})
    # Redirect the user back to the homepage with updated data
    return redirect('/')
@app.route('/log',methods=['GET','POST'])
def log():
    return render_template('log.html',data=l)

if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0")
