import React, { useState } from 'react';

function App() {
  const [inputType, setInputType] = useState('file');  // 'file' or 'url'
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    if (inputType === 'file') {
      if (!file) return;
      formData.append('gtfs', file);  // Añadimos el archivo seleccionado
    } else if (inputType === 'url') {
      if (!url) return;
      formData.append('url', url);  // Añadimos la URL
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,  // Enviar el archivo o la URL al backend
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', errorText);
        alert(`Error al subir o procesar el archivo/URL: ${errorText}`);
        return;
      }

      // Depurar el contenido del encabezado Content-Disposition
      const contentDisposition = response.headers.get('Content-Disposition');
      console.log('Encabezado Content-Disposition:', contentDisposition);

      let filename = 'modified_gtfs.zip';  // Valor por defecto si no se encuentra el filename
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');  // Eliminar comillas del nombre
        }
      }

      console.log('Nombre del archivo extraído:', filename);

      // Descargar el archivo .zip devuelto con el nombre correcto
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;  // Usar el nombre correcto del archivo
      document.body.appendChild(a);
      a.click();
      a.remove();
      alert('Archivo GTFS modificado descargado con éxito');
    } catch (error) {
      console.error('Error al subir o procesar el archivo/URL:', error);
      alert('Error inesperado al subir o procesar el archivo/URL');
    }
  };

  return (
    <div className="App">
      <h1>Subir archivo GTFS o Definir URL</h1>

      {/* Selector entre subir archivo o definir URL */}
      <div>
        <label>
          <input 
            type="radio" 
            value="file" 
            checked={inputType === 'file'} 
            onChange={() => setInputType('file')} 
          /> 
          Subir archivo
        </label>
        <label>
          <input 
            type="radio" 
            value="url" 
            checked={inputType === 'url'} 
            onChange={() => setInputType('url')} 
          /> 
          Definir URL
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        {inputType === 'file' && (
          <div>
            <input type="file" accept=".zip" onChange={handleFileChange} />
          </div>
        )}
        {inputType === 'url' && (
          <div>
            <input 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Introduce la URL del GTFS" 
            />
          </div>
        )}
        <button type="submit">Subir y procesar</button>
      </form>
    </div>
  );
}

export default App;