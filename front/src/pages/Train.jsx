import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

export default function Train() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trainingLog, setTrainingLog] = useState(null);
  const { datasetId, isCleaned, setModelId, modelType, setModelType, setMetrics, checkMetrics } = useAppContext();

  const handleTrain = async () => {
    if (!datasetId || !isCleaned) return;

    setLoading(true);
    setError(null);
    setTrainingLog(null);

    try {
      const response = await fetch('http://localhost:5000/api/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataset_id: datasetId, 
          model_type: modelType 
        }),
      });

      if (!response.ok) throw new Error('Error al entrenar modelo');

      const data = await response.json();
      setModelId(data.model_id);
      setMetrics(data.metrics);
      checkMetrics(data.metrics);
      setTrainingLog({
        time: data.training_time,
        status: data.status,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🤖 Entrenamiento del Modelo</h1>

      <Card title="Configuración">
        <label style={styles.label}>
          Selecciona el modelo:
          <select value={modelType} onChange={(e) => setModelType(e.target.value)} style={styles.select}>
            <option value="RandomForest">Random Forest</option>
            <option value="LogisticRegression">Regresión Logística</option>
            <option value="SVM">Support Vector Machine</option>
          </select>
        </label>

        <button onClick={handleTrain} disabled={loading} style={styles.button}>
          {loading ? 'Entrenando...' : 'Entrenar Modelo'}
        </button>
        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>

      {trainingLog && (
        <Card title="Log de Entrenamiento">
          <p><strong>Estado:</strong> {trainingLog.status}</p>
          <p><strong>Tiempo de entrenamiento:</strong> {trainingLog.time}s</p>
          <p style={styles.success}>✅ Modelo entrenado exitosamente</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  label: { display: 'block', marginBottom: '1rem', fontWeight: 'bold' },
  select: { display: 'block', width: '100%', padding: '0.5rem', marginTop: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ddd' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  error: { color: '#e74c3c', marginTop: '1rem' },
  success: { color: '#27ae60', fontWeight: 'bold', marginTop: '1rem' },
};
