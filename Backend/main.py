from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from model_logic import model_engine
import io

app = FastAPI(title="StudentGuard API", description="Backend para predicción de deserción estudiantil")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  #permitir al front que se conecte
    allow_credentials=True,
    allow_methods=["*"],  #permite todos los metodos 
    allow_headers=["*"],
)

class TrainingConfig(BaseModel):
    n_estimators: int = 100       #cantidad de arboles
    max_depth: Optional[int] = None #profundidad maxima
    min_samples_leaf: int = 1     #hojas por arbol

class StudentData(BaseModel):
    promedio_actual: float
    asistencia_clases: float
    tareas_entregadas: float
    participacion_clase: int 
    horas_estudio: float
    promedio_evaluaciones: float
    cursos_reprobados: int
    actividades_extracurriculares: int 
    reportes_disciplinarios: int

#endpoints 

@app.get("/")
def read_root():
    return {"message": "StudentGuard Backend is running"}

#carga Masiva
@app.post("/upload-csv")
async def upload_dataset(file: UploadFile = File(...)):
    contents = await file.read()
    file_buffer = io.BytesIO(contents)
    return model_engine.load_raw_data(file_buffer)

# 2.endpoint limpieza
@app.post("/clean-data")
def clean_dataset():
    result = model_engine.perform_cleaning()
    if result["status"] == "error":
        raise HTTPException(status_code=400, detail=result["message"])
    return result

#entrenamiento y ajuste de hiperparametros 
@app.post("/train-model")
def train_model(config: TrainingConfig):
    try:
        metrics = model_engine.train(
            n_estimators=config.n_estimators,
            max_depth=config.max_depth,
            min_samples_leaf=config.min_samples_leaf
        )
        return {"message": "Modelo entrenado exitosamente", "metrics": metrics}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#metricas actuales 
@app.get("/metrics")
def get_metrics():
    if not model_engine.metrics:
        raise HTTPException(status_code=404, detail="El modelo no ha sido entrenado aún.")
    return model_engine.metrics

#prediccion individual 
@app.post("/predict")
def predict_student(student: StudentData):
    try:
        #convertir el objeto pydantic a lista en orden
        data_list = [
            student.promedio_actual,
            student.asistencia_clases,
            student.tareas_entregadas,
            student.participacion_clase,
            student.horas_estudio,
            student.promedio_evaluaciones,
            student.cursos_reprobados,
            student.actividades_extracurriculares,
            student.reportes_disciplinarios
        ]
        
        result = model_engine.predict_single(data_list)
        
        #interpretacion del resultado
        mensaje = "Riesgo Alto de Deserción" if result == 1 else "Estudiante Estable"
        return {"prediction": result, "interpretation": mensaje}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))