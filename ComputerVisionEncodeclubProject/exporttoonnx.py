import ultralytics

from ultralytics import YOLO

# Load a model
#model = YOLO('yolov8n.pt')  # load an official model
# model = YOLO('path/to/best.pt')  # load a custom trained model

model = YOLO('yolov8n-cls.pt')

# Export the model
model.export(format='onnx')