import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

export default function Tune() {
  const { modelId, datasetId, setModelId, setMetrics, checkMetrics, modelType } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hiperparámetros para RandomForest
  const [nEstimators, setNEstimators] = useState(100);
  const [maxDepth, setMaxDepth] = useState(10);
  const [maxLeafNodes, setMaxLeafNodes] = useState(50);

  const handleRetrain = async () => {
    if (!modelId || !datasetId) return;

    setLoading(true);
    setError(null);

    try {
      const hyperparameters = {
        n_estimators: nEstimators,
        max_depth: maxDepth,
        max_leaf_nodes: maxLeafNodes,
      };

      const response = await fetch('http://localhost:5000/api/tune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          dataset_id: datasetId,
          model_type: modelType,
          hyperparameters 
        }),
      });

      if (!response.ok) throw new Error('Error al reentrenar modelo');

      const data = await response.json();
      setModelId(data.model_id);
      setMetrics(data.metrics);
      checkMetrics(data.metrics);
      alert('✅ Modelo reentrenado exitosamente. Revisa las métricas en "Evaluación".');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>⚙️ Ajuste de Hiperparámetros</h1>

      {!modelId && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>ℹ️ Vista de desarrollo. Entrena un modelo primero para ajustar hiperparámetros reales.</p>
        </Card>
      )}

      <Card title={`Configuración de ${modelType}`}>
        <div style={styles.sliderContainer}>
          <label style={styles.label}>
            Cantidad de árboles (n_estimators): <strong>{nEstimators}</strong>
            <input
              type="range"
              min="10"
              max="300"
              value={nEstimators}
              onChange={(e) => setNEstimators(Number(e.target.value))}
              style={styles.slider}
            />
          </label>

          <label style={styles.label}>
            Profundidad máxima (max_depth): <strong>{maxDepth}</strong>
            <input
              type="range"
              min="2"
              max="50"
              value={maxDepth}
              onChange={(e) => setMaxDepth(Number(e.target.value))}
              style={styles.slider}
            />
          </label>

          <label style={styles.label}>
            Máximo de hojas por árbol (max_leaf_nodes): <strong>{maxLeafNodes}</strong>
            <input
              type="range"
              min="10"
              max="200"
              value={maxLeafNodes}
              onChange={(e) => setMaxLeafNodes(Number(e.target.value))}
              style={styles.slider}
            />
          </label>
        </div>

        <button onClick={handleRetrain} disabled={loading} style={styles.button}>
          {loading ? 'Reentrenando...' : 'Reentrenar Modelo'}
        </button>
        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  sliderContainer: { marginBottom: '2rem' },
  label: { display: 'block', marginBottom: '1.5rem', fontWeight: 'bold' },
  slider: { display: 'block', width: '100%', marginTop: '0.5rem' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' },
  error: { color: '#e74c3c', marginTop: '1rem' },
};
