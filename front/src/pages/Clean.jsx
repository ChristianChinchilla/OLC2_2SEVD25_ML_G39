import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

export default function Clean() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { datasetId, setIsCleaned, cleaningResults, setCleaningResults } = useAppContext();

  const handleClean = async () => {
    if (!datasetId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:5000/api/clean', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset_id: datasetId }),
      });

      if (!response.ok) throw new Error('Error al limpiar datos');

      const data = await response.json();
      setCleaningResults(data);
      setIsCleaned(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1>🧹 Limpieza de Datos</h1>

      <Card title="Ejecutar Limpieza">
        <p>Este proceso eliminará valores faltantes, normalizará datos y corregirá inconsistencias.</p>
        <button onClick={handleClean} disabled={loading} style={styles.button}>
          {loading ? 'Limpiando...' : 'Ejecutar Limpieza'}
        </button>
        {error && <p style={styles.error}>❌ {error}</p>}
      </Card>

      {cleaningResults && (
        <Card title="Resultados de Limpieza">
          <p><strong>Valores faltantes detectados:</strong> {cleaningResults.missing_values || 0}</p>
          <p><strong>Filas procesadas:</strong> {cleaningResults.rows_processed || 0}</p>
          <p><strong>Normalizaciones aplicadas:</strong> {cleaningResults.normalizations || 'Ninguna'}</p>
          {cleaningResults.warnings && (
            <div style={styles.warnings}>
              <strong>⚠️ Advertencias:</strong>
              <ul>
                {cleaningResults.warnings.map((w, i) => <li key={i}>{w}</li>)}
              </ul>
            </div>
          )}
          <p style={styles.success}>✅ Limpieza completada exitosamente</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  button: { padding: '0.75rem 2rem', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '1rem' },
  error: { color: '#e74c3c', marginTop: '1rem' },
  success: { color: '#27ae60', fontWeight: 'bold', marginTop: '1rem' },
  warnings: { backgroundColor: '#fff3cd', padding: '1rem', borderRadius: '4px', marginTop: '1rem' },
};
