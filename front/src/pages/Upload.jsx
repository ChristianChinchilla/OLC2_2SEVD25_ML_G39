import { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import Card from '../components/Card';

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setDatasetId, setDatasetInfo, resetFlow } = useAppContext();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setError(null);
    } else if (selectedFile) {
      setError('Solo se permiten archivos .csv');
      setFile(null);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    resetFlow();

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al subir archivo');

      const data = await response.json();
      setDatasetId(data.dataset_id);
      setDatasetInfo({
        filename: file.name,
        rows: data.rows,
        columns: data.columns,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const { datasetInfo } = useAppContext();

  return (
    <div style={styles.container}>
      <h1>📁 Carga Masiva (CSV)</h1>

      <Card title="Subir Dataset">
        <div style={styles.dropzone}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            style={styles.hiddenInput}
          />
          <button 
            type="button"
            onClick={handleButtonClick} 
            style={styles.selectButton}
          >
            📂 Seleccionar Archivo CSV
          </button>
          {file && (
            <div style={styles.fileInfo}>
              <p>✅ Archivo seleccionado: <strong>{file.name}</strong></p>
              <p style={styles.fileSize}>Tamaño: {(file.size / 1024).toFixed(2)} KB</p>
            </div>
          )}
          {error && <p style={styles.error}>❌ {error}</p>}
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          style={{
            ...styles.button,
            ...((!file || loading) && styles.buttonDisabled)
          }}
        >
          {loading ? 'Subiendo...' : 'Subir Archivo'}
        </button>
      </Card>

      {datasetInfo && (
        <Card title="Información del Dataset">
          <p><strong>Archivo:</strong> {datasetInfo.filename}</p>
          <p><strong>Filas:</strong> {datasetInfo.rows}</p>
          <p><strong>Columnas:</strong> {datasetInfo.columns}</p>
        </Card>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', maxWidth: '800px', margin: '0 auto' },
  dropzone: { 
    border: '2px dashed #3498db', 
    padding: '2rem', 
    borderRadius: '8px', 
    textAlign: 'center', 
    marginBottom: '1rem',
    backgroundColor: '#f8f9fa'
  },
  hiddenInput: { 
    display: 'none' 
  },
  selectButton: {
    padding: '1rem 2rem',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  fileInfo: {
    marginTop: '1rem',
    padding: '1rem',
    backgroundColor: '#d4edda',
    borderRadius: '4px',
  },
  fileSize: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginTop: '0.5rem',
  },
  button: { 
    padding: '0.75rem 2rem', 
    backgroundColor: '#27ae60', 
    color: 'white', 
    border: 'none', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontSize: '1rem',
    fontWeight: 'bold',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    backgroundColor: '#95a5a6',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  error: { 
    color: '#e74c3c', 
    marginTop: '1rem',
    fontWeight: 'bold',
  },
};
