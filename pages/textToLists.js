import React, { useState } from 'react';

const TextToSQLGenerator = () => {
  const [text, setText] = useState('');
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([]);
  const [nullability, setNullability] = useState([]);
  const [types, setTypes] = useState([]);
  const [numEntries, setNumEntries] = useState(1);
  const [inputs, setInputs] = useState([]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };

  const handleTableNameChange = (e) => {
    setTableName(e.target.value.trim());
  };

  const handleNumEntriesChange = (e) => {
    const num = Number(e.target.value);
    setNumEntries(num);
    setInputs(Array(num).fill(columns.map(() => '')));
  };

  const generateLists = () => {
    const lines = text.trim().split('\n').slice(2); // Ignore first two lines (header)
    const cols = [];
    const nulls = [];
    const types = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/); // Split by whitespace
      const column = parts[0];
      let nullability = '';
      let type = '';

      if (line.includes('NOT NULL')) {
        nullability = 'NOT NULL';
        type = parts.slice(1).join(' ');
      } else {
        type = parts.slice(1).join(' ');
      }

      cols.push(column);
      nulls.push(nullability);
      types.push(type);
    });

    setColumns(cols);
    setNullability(nulls);
    setTypes(types);
    setInputs(Array(numEntries).fill(cols.map(() => '')));
  };

  const handleInputChange = (rowIdx, colIdx, value) => {
    const newInputs = [...inputs];
    newInputs[rowIdx] = [...newInputs[rowIdx]];
    newInputs[rowIdx][colIdx] = value;
    setInputs(newInputs);
  };

  const generateSQLScripts = () => {
    return inputs.map((row, rowIdx) => {
      const columnsList = columns.join(', ');
      const valuesList = row.map((value, colIdx) => {
        const type = types[colIdx];
        if (type.startsWith('VARCHAR') || type.startsWith('TIMESTAMP')) {
          return `'${value}'`;
        }
        return value;
      }).join(', ');

      return `INSERT INTO ${tableName} (${columnsList}) VALUES (${valuesList});`;
    }).join('\n');
  };

  const copyToClipboard = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      alert('Failed to copy: ', err);
    });
  };

  const scrollToScripts = () => {
    const element = document.getElementById('sql-scripts');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Sticky Buttons */}
      <div style={{ position: 'sticky', top: 0, backgroundColor: '#fff', padding: '10px', zIndex: 1000 }}>
        <button
          onClick={() => copyToClipboard(generateSQLScripts())}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
          Copy Scripts
        </button>
        <button
          onClick={scrollToScripts}
          style={{ marginRight: '10px', padding: '10px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px' }}>
          Navigate to Scripts
        </button>
        <button
          onClick={() => window.open('https://github.com/ganesh1729ganesh', '_blank')}
          style={{ padding: '10px', backgroundColor: '#f2f2f2', color: '#000', border: '1px solid #ccc', borderRadius: '4px' }}>
          Contribute
        </button>
      </div>

      {/* Table Name Input */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          value={tableName}
          onChange={handleTableNameChange}
          placeholder="Table Name"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          onClick={() => copyToClipboard(`DESC ${tableName};`)}
          style={{ padding: '10px', backgroundColor: '#008CBA', color: 'white', border: 'none', borderRadius: '4px' }}>
          <span role="img" aria-label="clipboard">📋</span> Copy DESC Command
        </button>
      </div>

      {/* Schema Input */}
      <textarea
        value={text}
        onChange={handleTextChange}
        rows="10"
        cols="50"
        placeholder="Paste your table schema text here..."
        style={{ marginBottom: '10px', width: '100%' }}
      />
      <br />
      <h4>Number of Entries to Input ?</h4>
      <input
        type="number"
        value={numEntries}
        onChange={handleNumEntriesChange}
        placeholder="Number of Entries"
        style={{ marginBottom: '10px' }}
      />
      <br />
      <button onClick={generateLists} style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}>
        Generate Input Table
      </button>

      {inputs.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Input Rows</h3>
          <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                {columns.map((col, index) => (
                  <th key={index}>
                    {col} ({types[index].trim()}{nullability[index] ? `, ${nullability[index]}` : ''})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inputs.map((row, rowIdx) => (
                <tr key={rowIdx}>
                  {row.map((value, colIdx) => (
                    <td key={colIdx}>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleInputChange(rowIdx, colIdx, e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div id="sql-scripts">
        <h3>Generated SQL Scripts</h3>
        <textarea
          readOnly
          value={generateSQLScripts()}
          rows="10"
          cols="50"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default TextToSQLGenerator;
