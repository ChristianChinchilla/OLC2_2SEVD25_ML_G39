import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

class StudentGuardModel:
    def __init__(self):
        self.model = None
        self.dataset = None
        self.metrics = {}
        
        #deficion de columnas
        self.required_columns = [
            'promedio_actual', 
            'asistencia_clases', 
            'tareas_entregadas',
            'participacion_clase', 
            'horas_estudio', 
            'promedio_evaluaciones',
            'cursos_reprobados', 
            'actividades_extracurriculares', 
            'reportes_disciplinarios', 
            'riesgo'  
        ]
        
        #nombre de la columna objetivo
        self.target_col = 'riesgo'

    def load_and_clean_data(self, file_content):
        try:
            #cargar csv 
            try:
                df = pd.read_csv(file_content)
                if len(df.columns) < 2: 
                     file_content.seek(0)
                     df = pd.read_csv(file_content, sep=';')
            except:
                file_content.seek(0)
                df = pd.read_csv(file_content, sep=';')

            #verificar columnas
            missing_cols = [col for col in self.required_columns if col not in df.columns]
            if missing_cols:
                return {"status": "error", "message": f"El CSV no cumple con el formato PDF. Faltan: {missing_cols}"}

            #limpieza
            mapping_participacion = {'alta': 3, 'media': 2, 'baja': 1}
            if df['participacion_clase'].dtype == 'object':
                df['participacion_clase'] = df['participacion_clase'].str.lower().map(mapping_participacion)

            #llenar vacios
            imputer = SimpleImputer(strategy='mean')
            data_cleaned = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)
            
            self.dataset = data_cleaned
            return {
                "status": "success", 
                "rows": len(self.dataset), 
                "message": "Datos cargados correctamente según especificaciones del PDF."
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def train(self, n_estimators=100, max_depth=None, min_samples_leaf=1):
        if self.dataset is None:
            raise ValueError("No hay datos cargados.")

        #separar X variables y riesgo/etiqueta
        X = self.dataset.drop(self.target_col, axis=1)
        y = self.dataset[self.target_col]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = RandomForestClassifier(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_leaf=min_samples_leaf,
            random_state=42
        )

        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)

        self.metrics = {
            "accuracy": round(accuracy_score(y_test, y_pred) * 100, 2),
            "precision": round(precision_score(y_test, y_pred, zero_division=0) * 100, 2),
            "recall": round(recall_score(y_test, y_pred, zero_division=0) * 100, 2),
            "f1_score": round(f1_score(y_test, y_pred, zero_division=0) * 100, 2)
        }

        return self.metrics

    def predict_single(self, student_data: list):
        
        
        if self.model is None:
            raise ValueError("El modelo no ha sido entrenado.")
        
        
        features = [col for col in self.required_columns if col != self.target_col]
        
        df_input = pd.DataFrame([student_data], columns=features)
        
        prediction = self.model.predict(df_input)
        return int(prediction[0])

model_engine = StudentGuardModel()