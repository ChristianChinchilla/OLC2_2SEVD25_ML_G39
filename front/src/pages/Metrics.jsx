import { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

export default function Metrics() {
  const { modelId, metrics, setMetrics, checkMetrics } = useAppContext();
  const [loading, setLoading] = useState(false);

  // Métricas de ejemplo para desarrollo frontend
  const exampleMetrics = {
    accuracy: 0.85,
    precision: 0.82,
    recall: 0.78,
    f1_score: 0.80,
  };

  useEffect(() => {
    if (modelId && !metrics) {
      fetchMetrics();
    }
  }, [modelId]);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/metrics/${modelId}`);
      if (!response.ok) throw new Error('Error al obtener métricas');
      const data = await response.json();
      setMetrics(data);
      checkMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Usar métricas de ejemplo si no hay modelo
  const displayMetrics = metrics || exampleMetrics;

  const metricsData = [
    { label: 'Exactitud (Accuracy)', value: displayMetrics?.accuracy, color: '#3498db', icon: '🎯' },
    { label: 'Precisión (Precision)', value: displayMetrics?.precision, color: '#e74c3c', icon: '🔍' },
    { label: 'Recall', value: displayMetrics?.recall, color: '#f39c12', icon: '📈' },
    { label: 'F1-Score', value: displayMetrics?.f1_score, color: '#27ae60', icon: '⚡' },
  ];

  return (
    <div style={styles.container}>
      <h1>📊 Evaluación del Modelo</h1>
      
      {!modelId && (
        <Card style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p>ℹ️ Mostrando métricas de ejemplo para desarrollo. Entrena un modelo para ver métricas reales.</p>
        </Card>
      )}

      <div style={styles.grid}>
        {metricsData.map((metric, index) => (
          <Card key={index} style={{ borderTop: `4px solid ${metric.color}` }}>
            <div style={styles.metricCard}>
              <span style={styles.icon}>{metric.icon}</span>
              <h3 style={styles.metricLabel}>{metric.label}</h3>
              <p style={{ ...styles.metricValue, color: metric.color }}>
                {metric.value ? (metric.value * 100).toFixed(2) + '%' : 'N/A'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Estado de Predicción">
        {checkMetrics(displayMetrics) ? (
          <p style={styles.success}>✅ El modelo cumple con las métricas deseadas. Predicción habilitada.</p>
        ) : (
          <p style={styles.warning}>⚠️ El modelo no cumple con las métricas mínimas. Considera ajustar hiperparámetros.</p>
        )}
        <p style={styles.info}>
          <strong>Requisitos mínimos:</strong> Accuracy &gt; 75%, Precision &gt; 70%, Recall &gt; 70%, F1-Score &gt; 70%
        </p>
      </Card>
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '1000px', margin: '0 auto' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
  metricCard: { textAlign: 'center' },
  icon: { fontSize: '2.5rem' },
  metricLabel: { fontSize: '1rem', margin: '0.5rem 0', color: '#34495e' },
  metricValue: { fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0' },
  success: { color: '#27ae60', fontWeight: 'bold' },
  warning: { color: '#f39c12', fontWeight: 'bold' },
  info: { marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' },
};
