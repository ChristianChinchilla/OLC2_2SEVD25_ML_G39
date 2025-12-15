# StudentGuard: Sistema de Predicción de Deserción Estudiantil

## Descripción General del Proyecto

StudentGuard es un sistema integral de aprendizaje supervisado desarrollado para predecir el riesgo de deserción estudiantil en instituciones de educación superior. El proyecto implementa un pipeline completo de ciencia de datos, que incluye carga de datos, limpieza y preprocesamiento, selección y entrenamiento de modelos de aprendizaje automático, evaluación del rendimiento, y predicción en tiempo real. El sistema está compuesto por un backend desarrollado en Python con FastAPI y un frontend interactivo en React, proporcionando una interfaz amigable para el análisis de datos estudiantiles y la generación de predicciones.

La arquitectura del sistema permite a los usuarios académicos cargar datos masivos de estudiantes, ejecutar procesos de limpieza y normalización de datos, entrenar modelos de clasificación, ajustar hiperparámetros, visualizar métricas de rendimiento y realizar predicciones individuales o masivas sobre el riesgo de deserción de estudiantes específicos.

## Objetivos del Proyecto

El proyecto StudentGuard persigue los siguientes objetivos académicos y funcionales:

1. **Desarrollar un modelo de clasificación binaria** capaz de predecir con precisión el riesgo de deserción estudiantil basándose en indicadores académicos y conductuales.

2. **Implementar un pipeline completo de aprendizaje automático** que incluya limpieza automática de datos, imputación de valores faltantes, normalización de características y evaluación mediante múltiples métricas.

3. **Crear un sistema de preprocesamiento robusto** que maneje inconsistencias en los datos, como valores faltantes, columnas con formatos heterogéneos, datos textuales en campos numéricos y listas en formato de cadena.

4. **Evaluar múltiples métricas de rendimiento** para garantizar la fiabilidad del modelo mediante accuracy, precisión, recall y F1-score.

5. **Facilitar el ajuste de hiperparámetros** permitiendo la experimentación con diferentes configuraciones del modelo para optimizar su desempeño.

6. **Proporcionar una interfaz de usuario intuitiva** que permita a académicos y administrativos acceder fácilmente a las funcionalidades de carga de datos, limpieza, entrenamiento, evaluación y predicción.

7. **Generar predicciones en tiempo real** para estudiantes individuales utilizando datos específicos de desempeño académico y conductual.

## Tecnologías Utilizadas

### Backend
- **Python 3.x**: Lenguaje principal para la lógica de aprendizaje automático y procesamiento de datos.
- **FastAPI**: Framework web de alto rendimiento para la construcción de APIs RESTful.
- **Uvicorn**: Servidor ASGI para ejecutar la aplicación FastAPI.
- **Pandas**: Biblioteca para manipulación, limpieza y análisis de datos tabulares.
- **Scikit-learn**: Librería de aprendizaje automático que proporciona herramientas para preprocesamiento, modelos y métricas.
- **Joblib**: Herramienta para serialización y persistencia de modelos entrenados.
- **Pydantic**: Librería para validación de datos y definición de esquemas.

### Frontend
- **React 19.2.0**: Biblioteca JavaScript para construcción de interfaces de usuario reactivas.
- **React Router DOM 7.10.1**: Sistema de enrutamiento para navegación entre páginas de la aplicación.
- **Vite 7.2.4**: Herramienta de construcción rápida para aplicaciones web modernas.
- **ESLint**: Herramienta para análisis estático de código JavaScript.

### Infraestructura
- **CORS (Cross-Origin Resource Sharing)**: Configurado en el backend para permitir comunicación entre frontend y backend.
- **REST API**: Arquitectura de comunicación entre cliente y servidor.

## Carga y Estructura de los Datos

### Características del Dataset

El dataset utilizado en StudentGuard contiene información académica y conductuales de estudiantes. Las características principales incluyen:

1. **promedio_actual** (float): Promedio académico actual del estudiante en escala numérica.
2. **asistencia_clases** (float): Porcentaje o frecuencia de asistencia a clases.
3. **tareas_entregadas** (float): Número o porcentaje de tareas completadas y entregadas.
4. **participacion_clase** (int/string): Nivel de participación en clase (puede ser categórico: 'alta', 'media', 'baja' o numérico: 1, 2, 3).
5. **horas_estudio** (float): Número de horas dedicadas al estudio independiente.
6. **promedio_evaluaciones** (float): Promedio de calificaciones en evaluaciones oficiales.
7. **cursos_reprobados** (int): Cantidad de cursos reprobados acumulativamente.
8. **actividades_extracurriculares** (int/string): Número de actividades extracurriculares (puede ser numérico o lista en formato cadena).
9. **reportes_disciplinarios** (int): Número de reportes o amonestaciones disciplinarias.
10. **riesgo** (string/int): Variable objetivo que indica si el estudiante tiene riesgo de deserción ('riesgo'/'no riesgo' o 1/0).

### Formato de Entrada

Los datos se cargan mediante un archivo CSV (valores separados por comas) o archivos delimitados por punto y coma. El sistema implementa detección automática del separador utilizado. La carga se realiza mediante el endpoint `/upload-csv` que acepta archivos en formato multipart/form-data.

### Estructura de Almacenamiento en Memoria

El sistema mantiene dos representaciones del dataset:
- **raw_dataset**: Dataset original sin modificaciones, almacenado después de la carga inicial.
- **dataset**: Dataset procesado y limpiado, disponible después de ejecutar el proceso de limpieza.

## Limpieza y Preprocesamiento de Datos

El proceso de limpieza y preprocesamiento es fundamental para garantizar la calidad de los datos de entrada al modelo. La función `perform_cleaning()` implementa un pipeline estructurado de transformaciones secuenciales.

### Manejo de Valores Faltantes

El sistema implementa imputación de valores faltantes utilizando la estrategia de **media aritmética**:

1. **Detección de valores nulos**: Se utilizan operaciones de Pandas para identificar valores `NaN`, `None` o vacíos.
2. **SimpleImputer con estrategia 'mean'**: Todos los campos numéricos con valores faltantes son rellenados con la media de los valores presentes en esa característica.
3. **Eliminación de registros incompletos en variable objetivo**: Los registros que contienen valores faltantes en la variable objetivo 'riesgo' son eliminados, ya que son esenciales para el aprendizaje supervisado.

Esta estrategia preserva el tamaño del dataset mientras garantiza que todas las características tengan valores válidos para el entrenamiento.

### Estandarización y Normalización

Aunque el código no implementa estandarización explícita (como StandardScaler), el preprocesamiento incluye:

1. **Conversión a tipo numérico**: Todas las características numéricas se convierten explícitamente a `float` o `int` usando `pd.to_numeric()` con tratamiento de errores para evitar excepciones.
2. **Escalado implícito**: Los datos se mantienen en sus rangos originales, asumiendo que características como promedios (0-100) y horas de estudio están en escalas similares. RandomForest no requiere normalización explícita.
3. **Normalización de texto en campos categóricos**: Se aplica conversión a minúsculas y mapeo de categorías.

### Tratamiento de Inconsistencias

El pipeline aborda múltiples tipos de inconsistencias observadas en datos académicos reales:

#### 1. **Inconsistencias en Campos Numéricos**
- **Problema**: Campos que deberían ser numéricos contienen texto, símbolos o caracteres especiales.
- **Solución**: Uso de `pd.to_numeric(..., errors='coerce')` que convierte valores inválidos a `NaN`, posteriormente manejados por imputación.

#### 2. **Inconsistencias en Campo de Participación**
- **Problema**: La característica 'participacion_clase' puede contener valores mixtos (textuales como 'alta', 'media', 'baja' o numéricos como 1, 2, 3).
- **Solución**: 
  - Se convierte el campo a tipo string
  - Se aplica normalización a minúsculas
  - Se mapea mediante diccionario: `{'alta': 3, 'media': 2, 'baja': 1}`
  - Se convierte a numérico nuevamente con tratamiento de errores

#### 3. **Inconsistencias en Actividades Extracurriculares**
- **Problema**: El campo puede contener:
  - Valores numéricos directos (ej: 2, 3)
  - Valores flotantes (ej: 2.0, 3.0)
  - Listas en formato cadena (ej: "[Deporte, Club]")
  - Valores vacíos o nulos
- **Solución**: Función personalizada `contar_actividades()` que:
  - Retorna 0 para valores nulos o cadenas vacías
  - Retorna el valor directo si es numérico (int o float)
  - Cuenta elementos en listas cadena contando comas (cantidad = ocurrencias de ',' + 1)

#### 4. **Inconsistencias en Variable Objetivo (Riesgo)**
- **Problema**: La variable objetivo puede tener formatos inconsistentes:
  - Texto: 'riesgo', 'no riesgo', 'Riesgo', 'RIESGO'
  - Numéricos: 1, 0, 1.0, 0.0
- **Solución**:
  - Conversión a tipo string
  - Conversión a minúsculas
  - Eliminación de espacios en blanco
  - Mapeo mediante diccionario: `{'riesgo': 1, 'no riesgo': 0, '1': 1, '0': 0, '1.0': 1, '0.0': 0}`
  - Eliminación de registros que no puedan ser mapeados

#### 5. **Validación de Estructura de Datos**
- Se valida que todas las columnas requeridas estén presentes en el dataset cargado
- Si falta alguna columna, se retorna un error con la lista de columnas faltantes
- Se seleccionan únicamente las columnas requeridas para evitar contaminación por características adicionales

#### 6. **Orden de Operaciones de Limpieza**
El pipeline ejecuta las transformaciones en el siguiente orden para garantizar consistencia:
1. Copia del dataset raw para no modificar datos originales
2. Filtrado de columnas requeridas
3. Limpieza de campos numéricos (conversión de tipos)
4. Limpieza de campo de actividades (conteo de listas)
5. Limpieza de participación (mapeo categórico)
6. Limpieza de variable objetivo (mapeo y eliminación de inválidos)
7. Imputación de valores faltantes en todas las características

## Selección del Modelo de Aprendizaje Automático

### Tipo de Aprendizaje

StudentGuard implementa **aprendizaje supervisado** en su forma de **clasificación binaria**. Esta clasificación es apropiada porque:

1. Se cuenta con una variable objetivo etiquetada ('riesgo'/'no riesgo')
2. El objetivo es predecir una categoría binaria discreta
3. Existen ejemplos de entrenamiento con resultados conocidos
4. El problema requiere asignación de nuevas instancias a una de dos clases

### Modelo Seleccionado y Justificación

Se selecciona el modelo **Random Forest Classifier** (Clasificador de Bosque Aleatorio) de la librería Scikit-learn. Las justificaciones técnicas son:

#### Ventajas de Random Forest
1. **Manejo de características múltiples**: Random Forest maneja naturalmente datos con características en diferentes escalas sin requerir normalización explícita.
2. **Robustez a valores atípicos**: Los árboles de decisión son menos sensibles a outliers comparados con modelos lineales.
3. **Importancia de características**: El modelo proporciona índices de importancia que permiten identificar qué características influyen más en la predicción de deserción.
4. **Paralelización**: El modelo puede entrenarse en paralelo, mejorando eficiencia computacional.
5. **Generalización**: La agregación de múltiples árboles reduce overfitting comparado con un árbol individual.
6. **Flexibilidad**: No asume relaciones lineales entre características y variable objetivo.

#### Comparación implícita con alternativas
- **Regresión Logística**: Requeriría normalización explícita y asume linealidad.
- **Máquinas de Vector de Soporte (SVM)**: Requiere búsqueda exhaustiva de hiperparámetros y normalización.
- **Árbol de Decisión Individual**: Tiende a overfitting.
- **Redes Neuronales**: Requiere más datos y es menos interpretable.

#### Justificación contextual
Random Forest es apropiado para datos académicos con características heterogéneas (numéricas, ordinales) y potenciales interacciones no lineales entre variables. La naturaleza interpretable del modelo lo hace adecuado para contextos académicos donde se requiere entender decisiones del modelo.

## Entrenamiento del Modelo

### Proceso de Entrenamiento

El entrenamiento del modelo se realiza mediante el endpoint `/train-model` y la función `train()` en la clase `StudentGuardModel`. El proceso implementa el siguiente flujo:

1. **Validación de datos procesados**: Se verifica que el dataset haya sido limpiado previamente.
2. **Separación de características y variable objetivo**:
   - **X**: Todas las características excepto 'riesgo'
   - **y**: Variable objetivo 'riesgo'
3. **División en conjunto de entrenamiento y prueba**: 
   - Proporción 80-20 (train-test split)
   - Utiliza `random_state=42` para reproducibilidad
   - Garantiza que el modelo sea evaluado en datos no vistos durante el entrenamiento
4. **Instanciación del modelo**: Se crea una instancia de RandomForestClassifier con los hiperparámetros especificados.
5. **Ajuste del modelo**: Se ejecuta `fit()` en los datos de entrenamiento.
6. **Predicción en conjunto de prueba**: Se generan predicciones en datos no vistos.
7. **Cálculo de métricas**: Se calculan accuracy, precisión, recall y F1-score.
8. **Almacenamiento**: El modelo entrenado se guarda en memoria para predicciones futuras.

### Código de Entrenamiento
```python
X = self.dataset.drop(self.target_col, axis=1)
y = self.dataset[self.target_col]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
self.model = RandomForestClassifier(n_estimators=n_estimators, max_depth=max_depth, 
                                     min_samples_leaf=min_samples_leaf, random_state=42)
self.model.fit(X_train, y_train)
y_pred = self.model.predict(X_test)
```

### Características del Entrenamiento
- **Reproducibilidad**: El parámetro `random_state=42` garantiza que resultados sean reproducibles
- **Escalabilidad**: El proceso puede manejar datasets de diferentes tamaños
- **Validación**: Los datos de prueba nunca se utilizan durante el entrenamiento, evitando data leakage

## Evaluación del Rendimiento

### Métricas Utilizadas y Justificación

El modelo se evalúa mediante cuatro métricas complementarias calculadas en el conjunto de prueba (20% del dataset):

#### 1. **Exactitud (Accuracy)**
- **Fórmula**: (VP + VN) / (VP + VN + FP + FN)
- **Definición**: Proporción de predicciones correctas sobre el total de predicciones.
- **Rango**: 0-100%
- **Justificación**: Métrica general de desempeño que indica si el modelo predice correctamente en ambas clases.
- **Limitación**: No es suficiente cuando las clases están desbalanceadas.

#### 2. **Precisión (Precision)**
- **Fórmula**: VP / (VP + FP)
- **Definición**: De los estudiantes predichos como "riesgo", cuántos realmente tienen riesgo.
- **Rango**: 0-100%
- **Justificación**: Crítica cuando los falsos positivos (alertar sobre riesgo innecesariamente) tienen alto costo. Una alta precisión minimiza intervenciones innecesarias.
- **Interpretación**: Si precisión es 80%, significa que de cada 10 estudiantes alertados, 8 realmente tienen riesgo.

#### 3. **Exhaustividad (Recall)**
- **Fórmula**: VP / (VP + FN)
- **Definición**: De los estudiantes que realmente tienen riesgo, cuántos el modelo identifica.
- **Rango**: 0-100%
- **Justificación**: Crítica cuando los falsos negativos (no identificar riesgo) tienen alto costo. Una alto recall minimiza estudiantes con riesgo no identificados.
- **Interpretación**: Si recall es 75%, significa que el modelo identifica al 75% de los estudiantes en riesgo, dejando pasar al 25%.

#### 4. **F1-Score**
- **Fórmula**: 2 × (Precisión × Recall) / (Precisión + Recall)
- **Definición**: Media armónica de precisión y recall.
- **Rango**: 0-100%
- **Justificación**: Métrica de equilibrio que considera tanto falsos positivos como falsos negativos. Es especialmente útil cuando se requiere balance entre precisión y recall.
- **Interpretación**: Proporciona una evaluación única que penaliza modelos que se especializan en una métrica a costa de otra.

### Matriz de Confusión y Terminología
- **VP (Verdaderos Positivos)**: Estudiantes con riesgo predichos como riesgo
- **VN (Verdaderos Negativos)**: Estudiantes sin riesgo predichos como sin riesgo
- **FP (Falsos Positivos)**: Estudiantes sin riesgo predichos como riesgo
- **FN (Falsos Negativos)**: Estudiantes con riesgo predichos como sin riesgo

### Recuperación de Métricas
El endpoint `/metrics` retorna las métricas del modelo más recientemente entrenado en formato JSON con valores porcentuales redondeados a dos decimales.

## Ajuste de Hiperparámetros

### Hiperparámetros Ajustables

El modelo RandomForest implementa ajuste de hiperparámetros mediante el endpoint `/train-model` que acepta configuración personalizada:

#### 1. **n_estimators** (Número de Árboles)
- **Tipo**: Entero positivo
- **Valor por defecto**: 100
- **Rango típico**: 10-1000
- **Justificación del default**: 100 árboles proporciona balance entre rendimiento y costo computacional.
- **Impacto**:
  - **Mayor valor**: Mejora generalización, reduce overfitting, pero aumenta tiempo de entrenamiento y memoria.
  - **Menor valor**: Entrenamiento más rápido pero modelo menos robusto.
- **Recomendación**: Aumentar si se observa underfitting; mantener o aumentar ligeramente si hay overfitting.

#### 2. **max_depth** (Profundidad Máxima del Árbol)
- **Tipo**: Entero positivo o None
- **Valor por defecto**: None (sin límite)
- **Rango típico**: 5-30
- **Justificación del default**: Permite que árboles crezcan sin restricción, confiando en ensemble para regularización.
- **Impacto**:
  - **Valor limitado (5-15)**: Reduce complejidad, previene overfitting, pero puede causar underfitting.
  - **Sin límite (None)**: Árboles complejos, potencial para overfitting, pero mejor captura de patrones.
- **Recomendación**: Establecer límite (ej: 15) si hay signos de overfitting; aumentar si hay underfitting.

#### 3. **min_samples_leaf** (Mínimas Muestras por Hoja)
- **Tipo**: Entero positivo
- **Valor por defecto**: 1
- **Rango típico**: 1-20
- **Justificación del default**: Permite hojas con una muestra, árboles complejos.
- **Impacto**:
  - **Valor 1**: Árboles pueden ser muy complejos, alto riesgo de overfitting.
  - **Valor mayor (5-20)**: Limita complejidad de árboles, previene overfitting, reduce sensibilidad a ruido.
- **Recomendación**: Comenzar con default; aumentar a 5-10 si hay overfitting evidente.

### Proceso de Ajuste

Aunque el sistema permite ajuste manual mediante configuración, el proceso típico es:

1. **Línea base**: Entrenar con parámetros por defecto
2. **Evaluación**: Revisar métricas (especialmente recall vs precision)
3. **Ajuste iterativo**: Modificar uno o varios hiperparámetros basándose en resultados
4. **Validación**: Reentrenar y comparar métricas
5. **Selección**: Elegir configuración que optimice la métrica objetivo (típicamente F1-score para balance)

## Proceso de Predicción

### Predicción Individual

El sistema implementa predicción individual mediante el endpoint `/predict` que acepta datos de un estudiante específico:

1. **Recepción de datos**: Se reciben 9 características del estudiante mediante POST con esquema JSON.
2. **Validación de esquema**: Pydantic valida que los datos cumplan tipos especificados (float, int).
3. **Ordenamiento de características**: Los datos se organizan en el orden correcto: promedio_actual, asistencia_clases, tareas_entregadas, participacion_clase, horas_estudio, promedio_evaluaciones, cursos_reprobados, actividades_extracurriculares, reportes_disciplinarios.
4. **Creación de DataFrame**: Se construye un DataFrame de Pandas con estructura idéntica al dataset de entrenamiento.
5. **Ejecución de predicción**: Se invoca `predict()` del modelo entrenado.
6. **Interpretación del resultado**: 
   - Predicción = 1: "Riesgo Alto de Deserción"
   - Predicción = 0: "Estudiante Estable"
7. **Respuesta JSON**: Se retorna la predicción numérica e interpretación textual.

### Estructura de Solicitud
```json
{
  "promedio_actual": 75.5,
  "asistencia_clases": 85.0,
  "tareas_entregadas": 90.0,
  "participacion_clase": 2,
  "horas_estudio": 5.0,
  "promedio_evaluaciones": 78.0,
  "cursos_reprobados": 1,
  "actividades_extracurriculares": 2,
  "reportes_disciplinarios": 0
}
```

### Estructura de Respuesta
```json
{
  "prediction": 0,
  "interpretation": "Estudiante Estable"
}
```

### Manejo de Errores
- Si el modelo no ha sido entrenado: Retorna error 500 con mensaje descriptivo.
- Si los datos de entrada son inválidos: Retorna error 400 con detalle de validación.

## Decisiones de Diseño del Sistema

### 1. Arquitectura Cliente-Servidor

**Decisión**: Separar Backend (Python) y Frontend (React) en aplicaciones independientes.

**Justificación**:
- Permite desarrollo independiente de componentes.
- Backend puede escalar sin afectar frontend.
- Facilita integración con múltiples clientes.
- Separación de responsabilidades clara.

### 2. Pipeline de Dos Etapas para Datos

**Decisión**: Mantener raw_dataset y dataset separados; requerir llamada explícita a `/clean-data`.

**Justificación**:
- Permite auditoría de datos originales vs procesados.
- Usuarios visualizan el impacto de limpieza.
- Evita limpieza automática que oculte problemas de datos.
- Permite reintentar limpieza con diferentes estrategias.

### 3. Estrategia de Imputación por Media

**Decisión**: Usar SimpleImputer con estrategia 'mean' para valores faltantes.

**Justificación**:
- Preserva el tamaño del dataset (no elimina registros incompletos).
- Mantiene la media general de cada característica.
- Computacionalmente eficiente.
- Apropiado para distribuciones aproximadamente normales.

**Alternativas consideradas**:
- Mediana: Requeriría conversión adicional; media es suficiente.
- Valores por defecto: Introducería sesgo.
- Eliminación de registros: Reduciría datos valiosos.

### 4. Random Forest vs Alternativas

**Decisión**: Seleccionar Random Forest como modelo principal.

**Justificación técnica**:
- No requiere normalización explícita.
- Maneja naturalmente características mixtas.
- Proporciona índices de importancia.
- Resistente a overfitting gracias a ensemble.
- Interpretable en contexto académico.

### 5. Evaluación Multi-métrica

**Decisión**: Utilizar Accuracy, Precisión, Recall y F1-score simultáneamente.

**Justificación**:
- Ninguna métrica individual es suficiente.
- Académicos requieren comprensión completa del trade-off.
- Permite identificar si modelo favorece una clase.
- F1-score proporciona evaluación holística.

### 6. Validación Temprana de Estructura

**Decisión**: Validar que todas las columnas requeridas estén presentes al cargar datos.

**Justificación**:
- Previene errores silenciosos en pasos posteriores.
- Proporciona feedback inmediato.
- Clarifica requisitos de formato de datos.

### 7. Manejo Heterogéneo de Participación y Actividades

**Decisión**: Implementar funciones de limpieza personalizadas para campos problemáticos.

**Justificación**:
- Datos académicos reales tienen inconsistencias.
- Funciones específicas manejan múltiples formatos.
- Más robusto que rechazar datos inconsistentes.

### 8. CORS Abierto (permitir todos los orígenes)

**Decisión**: Configurar CORS con `allow_origins=["*"]`.

**Justificación**:
- Desarrollo inicial sin restricciones.
- Frontend puede estar en puerto diferente.
- Facilita testing desde múltiples clientes.

**Nota**: En producción, restringir a dominios específicos.

## Consideraciones, Limitaciones y Buenas Prácticas

### Consideraciones Técnicas

#### 1. **Supuestos del Modelo**
- Se asume que las 9 características capturan los factores principales en riesgo de deserción.
- Se asume que las relaciones entre características y riesgo son aprendibles con estructura árborisitca.
- Se asume que distribución de datos de entrenamiento es representativa de población futura.

#### 2. **Escalabilidad**
- El sistema actual mantiene modelos en memoria.
- Para producción, implementar persistencia en disco (joblib).
- Para datasets muy grandes, considerar procesamiento por lotes.

#### 3. **Reproducibilidad**
- `random_state=42` en train_test_split y RandomForestClassifier asegura reproducibilidad.
- Mismo dataset y configuración generarán idénticos resultados.

### Limitaciones del Sistema

#### 1. **Limitación de Datos de Entrenamiento**
- La precisión del modelo depende directamente de cantidad y calidad de datos disponibles.
- Datasets pequeños pueden llevar a overfitting o generalización pobre.
- Datos desbalanceados (muchos casos "no riesgo") pueden sesgarse hacia la clase mayoritaria.

#### 2. **Limitación de Características**
- Solo 9 características académico-conductuales.
- No incluye factores socioeconómicos, psicológicos o contextuales.
- Puede omitir patrones importantes de deserción.

#### 3. **Interpretabilidad Limitada**
- Random Forest proporciona importancia de características a nivel conjunto.
- No explica por qué un estudiante específico es predicho como "riesgo".
- Para transparencia académica, podría complementarse con técnicas SHAP o LIME.

#### 4. **Falta de Validación Cruzada Explícita**
- El sistema solo implementa train-test split simple.
- Validación cruzada k-fold proporcionaría estimación más confiable.
- No se implementan técnicas de regularización adicionales.

#### 5. **Potencial Data Leakage**
- Si algunas características se conocen solo después de deserción, hay leakage.
- Requiere auditoría temporal de cuándo se conoce cada característica.

#### 6. **Manejo de Clases Desbalanceadas**
- Si clases están severamente desbalanceadas, métrica puede engañar.
- No se implementa estratificación, SMOTE u otros métodos de balanceo.

### Buenas Prácticas Implementadas

#### 1. **Separación de Responsabilidades**
- Clase `StudentGuardModel` encapsula toda lógica ML.
- Endpoints en FastAPI manejan solo comunicación HTTP.
- Facilita testing y mantenimiento.

#### 2. **Manejo de Errores**
- Funciones validan precondiciones (ej: datos cargados antes de limpiar).
- HTTPException con códigos apropiados (400, 404, 500).
- Mensajes de error descriptivos.

#### 3. **Validación de Entrada**
- Pydantic valida estructura de datos en `/predict`.
- Tipos estrictos (float vs int).
- Previene inyección de datos inválidos.

#### 4. **Reproducibilidad**
- `random_state=42` en componentes estocásticos.
- Mismo input genera mismo output.
- Esencial para validación académica.

#### 5. **Documentación de API**
- FastAPI genera automáticamente documentación Swagger.
- Títulos y descripciones en endpoints.
- Esquemas Pydantic auto-documentados.

### Buenas Prácticas Recomendadas (No Implementadas)

#### 1. **Persistencia de Modelos**
Implementar guardado de modelos entrenados:
```python
joblib.dump(self.model, 'modelo_entrenado.pkl')
```

#### 2. **Logging**
Agregar logging para auditoría y debugging:
```python
import logging
logger = logging.getLogger(__name__)
```

#### 3. **Validación Cruzada**
Para estimación de rendimiento más confiable:
```python
from sklearn.model_selection import cross_val_score
```

#### 4. **Matriz de Confusión**
Visualizar distribución de errores:
```python
from sklearn.metrics import confusion_matrix
```

#### 5. **Manejo de Imbalance**
Para datasets desbalanceados:
```python
from imblearn.over_sampling import SMOTE
```

#### 6. **Testing Automatizado**
Suite de tests unitarios e integración:
```python
import pytest
```

#### 7. **Documentación de Tipos**
Type hints completos para autocompletado:
```python
def train(self, n_estimators: int = 100) -> Dict[str, float]:
```

#### 8. **Versionamiento de Datos**
Rastrear cambios en datasets y modelos:
```python
# Usar DVC (Data Version Control) o similar
```

## Conclusiones

StudentGuard implementa exitosamente un pipeline completo de aprendizaje automático supervisado para predicción de deserción estudiantil. El sistema demuestra integración efectiva de:

1. **Ciencia de datos**: Preprocesamiento robusto maneja heterogeneidad de datos reales académicos mediante tratamiento especializado de inconsistencias en participación, actividades y variables objetivo.

2. **Selección de modelos**: Random Forest proporciona balance entre rendimiento predictivo, interpretabilidad y robustez, siendo apropiado para contexto académico con características mixtas.

3. **Evaluación rigurosa**: Cuatro métricas complementarias (Accuracy, Precisión, Recall, F1-score) proporcionan evaluación integral, permitiendo decisiones informadas sobre trade-offs entre falsos positivos y negativos.

4. **Ingeniería de software**: Arquitectura cliente-servidor, validación de datos, manejo de errores y separación de responsabilidades facilitan mantenimiento, escalabilidad y testing.

5. **Usabilidad**: Interfaz REST bien definida permite a no-programadores acceder a capacidades de ML complejas mediante aplicación web intuitiva.

### Limitaciones Reconocidas

El sistema tiene limitaciones explícitas que deben considerarse:
- Dependencia de calidad y cantidad de datos de entrenamiento
- Características limitadas a 9 variables académico-conductuales
- Interpretabilidad limitada a nivel de importancia general de características
- Ausencia de validación cruzada y técnicas avanzadas de regularización

### Potencial de Mejora

Para versiones futuras se recomienda:
- Implementar validación cruzada k-fold
- Adicionar técnicas de manejo de desbalance (SMOTE)
- Implementar interpretabilidad local (SHAP/LIME)
- Persistencia de modelos en disco
- Logging y monitoreo en producción
- Testing automatizado integral
- Análisis temporal de características
- Integración con sistemas de información universitarios para datos frescos

### Aplicabilidad Académica

StudentGuard cumple objetivos académicos como proyecto de aprendizaje supervisado, demostrando:
- Dominio de librerías estándar (Pandas, Scikit-learn, FastAPI)
- Implementación de pipeline ML completo
- Toma de decisiones técnicas justificadas
- Consideración de limitaciones y buenas prácticas

El proyecto es apto para uso institucional como herramienta de apoyo para identificar estudiantes en riesgo, permitiendo intervenciones tempranas para retención estudiantil.