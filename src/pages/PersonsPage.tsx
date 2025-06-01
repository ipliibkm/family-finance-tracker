import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Person } from '../types';
import { Plus, Trash2, Edit, X, Save, User } from 'lucide-react';

const PersonsPage: React.FC = () => {
  const { persons, addPerson, updatePerson, deletePerson } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [editName, setEditName] = useState('');

  const handleAddPerson = () => {
    if (newPersonName.trim()) {
      addPerson({ name: newPersonName.trim() });
      setNewPersonName('');
      setIsAdding(false);
    }
  };

  const handleUpdatePerson = (id: string) => {
    if (editName.trim()) {
      const person = persons.find(p => p.id === id);
      if (person) {
        updatePerson({ ...person, name: editName.trim() });
        setEditId(null);
        setEditName('');
      }
    }
  };

  const startEdit = (person: Person) => {
    setEditId(person.id);
    setEditName(person.name);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName('');
  };

  const confirmDelete = (id: string, name: string) => {
    if (window.confirm(`Möchten Sie "${name}" wirklich löschen? Alle zugehörigen Konten und Transaktionen werden ebenfalls gelöscht.`)) {
      deletePerson(id);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>Personen</h1>
        <button 
          onClick={() => setIsAdding(true)} 
          className="btn btn-primary flex items-center"
          disabled={isAdding}
        >
          <Plus size={18} className="mr-1" /> Person hinzufügen
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isAdding && (
          <div className="p-4 border-b border-gray-100 bg-gray-50 animate-fade-in">
            <h3 className="font-medium mb-3">Neue Person hinzufügen</h3>
            <div className="flex items-center">
              <input
                type="text"
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Name"
                className="input mr-2"
                autoFocus
              />
              <button 
                onClick={handleAddPerson}
                className="btn btn-success mr-2 flex items-center"
                disabled={!newPersonName.trim()}
              >
                <Save size={18} className="mr-1" /> Speichern
              </button>
              <button 
                onClick={() => {
                  setIsAdding(false);
                  setNewPersonName('');
                }}
                className="btn btn-outline flex items-center"
              >
                <X size={18} className="mr-1" /> Abbrechen
              </button>
            </div>
          </div>
        )}

        {persons.length === 0 && !isAdding ? (
          <div className="p-8 text-center text-gray-500">
            <User size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="mb-4">Keine Personen vorhanden</p>
            <button 
              onClick={() => setIsAdding(true)} 
              className="btn btn-primary"
            >
              Person hinzufügen
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {persons.map(person => (
              <li key={person.id} className="p-4 hover:bg-gray-50">
                {editId === person.id ? (
                  <div className="flex items-center animate-fade-in">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input mr-2"
                      autoFocus
                    />
                    <button 
                      onClick={() => handleUpdatePerson(person.id)}
                      className="btn btn-success mr-2 flex items-center"
                      disabled={!editName.trim()}
                    >
                      <Save size={18} className="mr-1" /> Speichern
                    </button>
                    <button 
                      onClick={cancelEdit}
                      className="btn btn-outline flex items-center"
                    >
                      <X size={18} className="mr-1" /> Abbrechen
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="text-lg">{person.name}</span>
                    <div>
                      <button
                        onClick={() => startEdit(person)}
                        className="text-gray-500 hover:text-primary-400 p-1"
                        title="Bearbeiten"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(person.id, person.name)}
                        className="text-gray-500 hover:text-error-400 p-1 ml-1"
                        title="Löschen"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PersonsPage;