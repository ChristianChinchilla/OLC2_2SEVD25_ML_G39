import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

class StudentGuardModel:
    def __init__(self):
        self.model = None
        self.raw_dataset = None 
        self.dataset = None     
        self.metrics = {}
        
        self.required_columns = [
            'promedio_actual', 'asistencia_clases', 'tareas_entregadas',
            'participacion_clase', 'horas_estudio', 'promedio_evaluaciones',
            'cursos_reprobados', 'actividades_extracurriculares', 
            'reportes_disciplinarios', 'riesgo'
        ]
        self.target_col = 'riesgo'

    def load_raw_data(self, file_content):
        """Solo lee el archivo y lo guarda en memoria tal cual viene."""
        try:
            #intentar leer con coma o punto y coma
            try:
                df = pd.read_csv(file_content)
                if len(df.columns) < 2: 
                     file_content.seek(0)
                     df = pd.read_csv(file_content, sep=';')
            except:
                file_content.seek(0)
                df = pd.read_csv(file_content, sep=';')

            self.raw_dataset = df 
            self.dataset = None   
            
            return {
                "status": "success", 
                "rows": len(df), 
                "message": "Archivo cargado en memoria. Pendiente de limpieza."
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def perform_cleaning(self):
        """Realiza la limpieza sobre los datos cargados."""
        if self.raw_dataset is None:
            raise ValueError("No hay datos cargados. Sube un archivo primero.")

        try:
            df = self.raw_dataset.copy()
            
            #filtrado de columnas
            missing_cols = [col for col in self.required_columns if col not in df.columns]
            if missing_cols:
                return {"status": "error", "message": f"Faltan columnas: {missing_cols}"}
            
            df = df[self.required_columns].copy()

            #limpiza de numericas
            cols_numericas = [
                'promedio_actual', 'asistencia_clases', 'tareas_entregadas',
                'horas_estudio', 'promedio_evaluaciones',
                'cursos_reprobados', 'reportes_disciplinarios'
            ]
            for col in cols_numericas:
                df[col] = pd.to_numeric(df[col], errors='coerce')

            #limpieza de actividades
            def contar_actividades(val):
                try:
                    if pd.isna(val) or val == "": return 0
                    if isinstance(val, (int, float)): return val
                    if isinstance(val, str):
                        if "[" not in val: return 0
                        return val.count(",") + 1
                    return 0
                except:
                    return 0
            df['actividades_extracurriculares'] = df['actividades_extracurriculares'].apply(contar_actividades)

            #limpieza de participacion
            map_part = {'alta': 3, 'media': 2, 'baja': 1}
            if df['participacion_clase'].dtype == 'object':
                df['participacion_clase'] = df['participacion_clase'].astype(str).str.lower().map(map_part)
            df['participacion_clase'] = pd.to_numeric(df['participacion_clase'], errors='coerce')

            #limpieza de riesgo
            df['riesgo'] = df['riesgo'].astype(str).str.lower().str.strip()
            risk_map = {'riesgo': 1, 'no riesgo': 0, '1': 1, '0': 0, '1.0': 1, '0.0': 0}
            df['riesgo'] = df['riesgo'].map(risk_map)
            df = df.dropna(subset=['riesgo'])

            #llenar vacios
            filas_antes = len(df)
            imputer = SimpleImputer(strategy='mean')
            data_cleaned = pd.DataFrame(imputer.fit_transform(df), columns=df.columns)
            
            self.dataset = data_cleaned
            
            return {
                "status": "success",
                "rows_processed": len(self.dataset),
                "missing_values_fixed": "Sí (Imputación por media)",
                "normalizations": "Texto a Numérico, Listas contadas",
                "message": "Limpieza ejecutada correctamente"
            }
            
        except Exception as e:
            return {"status": "error", "message": f"Error en limpieza: {str(e)}"}

    def train(self, n_estimators=100, max_depth=None, min_samples_leaf=1):
        if self.dataset is None:
             raise ValueError("Debes ejecutar la Limpieza de Datos antes de entrenar.")
        
        X = self.dataset.drop(self.target_col, axis=1)
        y = self.dataset[self.target_col]
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, min_samples_leaf=min_samples_leaf, random_state=42)
        self.model.fit(X_train, y_train)
        y_pred = self.model.predict(X_test)
        self.metrics = {"accuracy": round(accuracy_score(y_test, y_pred)*100, 2), "precision": round(precision_score(y_test, y_pred, zero_division=0)*100, 2), "recall": round(recall_score(y_test, y_pred, zero_division=0)*100, 2), "f1_score": round(f1_score(y_test, y_pred, zero_division=0)*100, 2)}
        return self.metrics

    def predict_single(self, student_data: list):
        if self.model is None: raise ValueError("El modelo no ha sido entrenado.")
        features = [col for col in self.required_columns if col != self.target_col]
        df_input = pd.DataFrame([student_data], columns=features)
        prediction = self.model.predict(df_input)
        return int(prediction[0])

model_engine = StudentGuardModel()