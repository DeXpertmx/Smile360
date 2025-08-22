
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Save, 
  Printer, 
  Calendar, 
  FileText, 
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Odontograma, DienteData, TratamientoDiente, CaraDiente, TRATAMIENTOS_SUGERIDOS } from './odontograma';

interface Paciente {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
}

interface OdontogramaRecord {
  id: string;
  patientId: string;
  fecha: string;
  datos: DienteData[];
  tratamientosSugeridos: TratamientoDiente[];
  notas: string;
  doctor: string;
}

export function OdontogramaModule() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null);
  const [busquedaPaciente, setBusquedaPaciente] = useState('');
  const [odontogramas, setOdontogramas] = useState<OdontogramaRecord[]>([]);
  const [odontogramaActual, setOdontogramaActual] = useState<OdontogramaRecord | null>(null);
  const [datosOdontograma, setDatosOdontograma] = useState<DienteData[]>([]);
  const [tratamientosSugeridos, setTratamientosSugeridos] = useState<TratamientoDiente[]>([]);
  const [notas, setNotas] = useState('');
  const [cargando, setCargando] = useState(false);

  // Cargar pacientes al inicializar
  useEffect(() => {
    cargarPacientes();
  }, []);

  // Cargar odontogramas cuando se selecciona un paciente
  useEffect(() => {
    if (pacienteSeleccionado) {
      cargarOdontogramas(pacienteSeleccionado.id);
    }
  }, [pacienteSeleccionado]);

  const cargarPacientes = async () => {
    try {
      setCargando(true);
      const response = await fetch('/api/patients');
      if (response.ok) {
        const data = await response.json();
        // La API devuelve { patients: Patient[], total: number }
        setPacientes(data.patients || []);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
      setPacientes([]); // Set empty array as fallback
    } finally {
      setCargando(false);
    }
  };

  const cargarOdontogramas = async (pacienteId: string) => {
    try {
      setCargando(true);
      const response = await fetch(`/api/odontograma/patient/${pacienteId}`);
      if (response.ok) {
        const data = await response.json();
        setOdontogramas(data);
        // Cargar el más reciente si existe
        if (data.length > 0) {
          cargarOdontograma(data[0]);
        } else {
          // Nuevo odontograma
          inicializarNuevoOdontograma();
        }
      }
    } catch (error) {
      console.error('Error al cargar odontogramas:', error);
      toast.error('Error al cargar los odontogramas del paciente');
    } finally {
      setCargando(false);
    }
  };

  const inicializarNuevoOdontograma = () => {
    setOdontogramaActual(null);
    setDatosOdontograma([]);
    setTratamientosSugeridos([]);
    setNotas('');
  };

  const cargarOdontograma = (odontograma: OdontogramaRecord) => {
    setOdontogramaActual(odontograma);
    setDatosOdontograma(odontograma.datos || []);
    setTratamientosSugeridos(odontograma.tratamientosSugeridos || []);
    setNotas(odontograma.notas || '');
  };

  const guardarOdontograma = async () => {
    if (!pacienteSeleccionado) {
      toast.error('Debe seleccionar un paciente');
      return;
    }

    // Validar que haya datos para guardar o que sea una actualización de notas
    const hayDatosSignificativos = datosOdontograma.some(dato => 
      Object.values(dato.caras).some(cara => cara !== 'sano')
    );
    
    const hayTratamientos = tratamientosSugeridos.length > 0;
    const hayNotas = notas && notas.trim() !== '';
    
    if (!hayDatosSignificativos && !hayTratamientos && !hayNotas && !odontogramaActual) {
      toast.error('Debe realizar cambios en el odontograma antes de guardarlo');
      return;
    }

    try {
      setCargando(true);
      
      console.log('Guardando odontograma para paciente:', pacienteSeleccionado.id);
      console.log('Datos del odontograma:', datosOdontograma);
      console.log('Tratamientos sugeridos:', tratamientosSugeridos);
      
      const odontogramaData = {
        patientId: pacienteSeleccionado.id,
        datos: datosOdontograma,
        tratamientosSugeridos: tratamientosSugeridos || [],
        notas: notas || ''
      };

      const url = odontogramaActual 
        ? `/api/odontograma/${odontogramaActual.id}`
        : '/api/odontograma';
      
      const method = odontogramaActual ? 'PUT' : 'POST';

      console.log(`Enviando ${method} a ${url} con datos:`, odontogramaData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(odontogramaData),
        credentials: 'include', // Asegurar que las cookies de sesión se envíen
      });

      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const saved = await response.json();
        console.log('Odontograma guardado exitosamente:', saved);
        
        toast.success(odontogramaActual ? 'Odontograma actualizado exitosamente' : 'Odontograma creado exitosamente');
        
        // Recargar la lista
        await cargarOdontogramas(pacienteSeleccionado.id);
        
        // Seleccionar el guardado con los datos parseados correctamente
        const odontogramaFormateado = {
          ...saved,
          datos: saved.datos || [],
          tratamientosSugeridos: saved.tratamientosSugeridos || []
        };
        cargarOdontograma(odontogramaFormateado);
      } else {
        console.error('Error en la respuesta del servidor:', response.status);
        const errorText = await response.text();
        console.error('Texto del error:', errorText);
        
        let errorMessage = 'Error al guardar el odontograma';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        // Agregar información específica basada en el código de estado
        if (response.status === 401) {
          errorMessage = 'Sesión expirada. Por favor, recargue la página e intente de nuevo.';
        } else if (response.status === 403) {
          errorMessage = 'No tiene permisos para realizar esta operación.';
        } else if (response.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor, intente de nuevo.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error completo al guardar odontograma:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al guardar el odontograma';
      toast.error(errorMessage);
    } finally {
      setCargando(false);
    }
  };

  const handleDienteChange = (numero: number, caras: CaraDiente) => {
    setDatosOdontograma(prevDatos => {
      const nuevosdatos = [...prevDatos];
      const index = nuevosdatos.findIndex(d => d.numero === numero);
      
      if (index >= 0) {
        nuevosdatos[index] = { numero, caras };
      } else {
        nuevosdatos.push({ numero, caras });
      }
      
      return nuevosdatos;
    });
  };

  const handleCrearTratamiento = (tratamiento: TratamientoDiente) => {
    setTratamientosSugeridos(prev => {
      const existe = prev.find(t => t.numero === tratamiento.numero && t.cara === tratamiento.cara);
      if (existe) {
        return prev.map(t => 
          t.numero === tratamiento.numero && t.cara === tratamiento.cara 
            ? tratamiento 
            : t
        );
      } else {
        return [...prev, tratamiento];
      }
    });
    
    toast.success(`Tratamiento sugerido agregado para diente ${tratamiento.numero}`);
  };

  const eliminarTratamiento = (numero: number, cara: string) => {
    setTratamientosSugeridos(prev => 
      prev.filter(t => !(t.numero === numero && t.cara === cara))
    );
  };

  const pacientesFiltrados = pacientes.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(busquedaPaciente.toLowerCase()) ||
    p.email.toLowerCase().includes(busquedaPaciente.toLowerCase())
  );

  const imprimirOdontograma = () => {
    if (!pacienteSeleccionado) {
      toast.error('Debe seleccionar un paciente');
      return;
    }
    
    // Implementar lógica de impresión
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Odontograma</h1>
          <p className="text-gray-600">Registro visual del estado dental</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={guardarOdontograma} 
            disabled={cargando || !pacienteSeleccionado}
            variant={(() => {
              const hayDatosSignificativos = datosOdontograma.some(dato => 
                Object.values(dato.caras).some(cara => cara !== 'sano')
              );
              const hayTratamientos = tratamientosSugeridos.length > 0;
              const hayNotas = notas && notas.trim() !== '';
              
              return (hayDatosSignificativos || hayTratamientos || hayNotas) ? "default" : "outline";
            })()}
          >
            <Save className="w-4 h-4 mr-2" />
            {cargando ? 'Guardando...' : 'Guardar'}
          </Button>
          <Button 
            variant="outline" 
            onClick={imprimirOdontograma}
            disabled={!pacienteSeleccionado}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de Pacientes */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Seleccionar Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar paciente..."
                value={busquedaPaciente}
                onChange={(e) => setBusquedaPaciente(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-2">
              {pacientesFiltrados.map((paciente) => (
                <div
                  key={paciente.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    pacienteSeleccionado?.id === paciente.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPacienteSeleccionado(paciente)}
                >
                  <div className="font-medium">{paciente.firstName} {paciente.lastName}</div>
                  <div className="text-sm text-gray-500">{paciente.email}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Panel Principal */}
        <div className="lg:col-span-3 space-y-6">
          {pacienteSeleccionado ? (
            <>
              {/* Información del Paciente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {pacienteSeleccionado.firstName} {pacienteSeleccionado.lastName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="text-gray-600">{pacienteSeleccionado.email}</p>
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span>
                      <p className="text-gray-600">{pacienteSeleccionado.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium">Fecha de Nacimiento:</span>
                      <p className="text-gray-600">
                        {new Date(pacienteSeleccionado.birthDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Odontogramas:</span>
                      <p className="text-gray-600">{odontogramas.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="odontograma" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="odontograma">Odontograma</TabsTrigger>
                  <TabsTrigger value="tratamientos">
                    Tratamientos Sugeridos ({tratamientosSugeridos.length})
                  </TabsTrigger>
                  <TabsTrigger value="historial">Historial</TabsTrigger>
                </TabsList>

                <TabsContent value="odontograma">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Odontograma Actual
                        {odontogramaActual && (
                          <Badge variant="secondary">
                            {new Date(odontogramaActual.fecha).toLocaleDateString()}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Odontograma
                        pacienteId={pacienteSeleccionado.id}
                        datos={datosOdontograma}
                        onDienteChange={handleDienteChange}
                        onCrearTratamiento={handleCrearTratamiento}
                        readonly={false}
                      />
                      
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notas del Odontograma
                        </label>
                        <Textarea
                          placeholder="Observaciones, hallazgos importantes, recomendaciones..."
                          value={notas}
                          onChange={(e) => setNotas(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tratamientos">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Tratamientos Sugeridos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tratamientosSugeridos.length > 0 ? (
                        <div className="space-y-3">
                          {tratamientosSugeridos.map((tratamiento, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                              <div>
                                <div className="font-medium">
                                  Diente {tratamiento.numero} - Cara {tratamiento.cara}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Estado actual: <span className="font-medium">{tratamiento.estadoActual}</span>
                                </div>
                                <div className="text-sm text-blue-600">
                                  Sugerido: {tratamiento.tratamientoSugerido}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => eliminarTratamiento(tratamiento.numero, tratamiento.cara)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Eliminar
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No hay tratamientos sugeridos</p>
                          <p className="text-sm">Haz doble clic en las áreas afectadas del odontograma</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="historial">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Historial de Odontogramas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {odontogramas.length > 0 ? (
                        <div className="space-y-3">
                          {odontogramas.map((odontograma) => (
                            <div
                              key={odontograma.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                odontogramaActual?.id === odontograma.id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => cargarOdontograma(odontograma)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {new Date(odontograma.fecha).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    Doctor: {odontograma.doctor}
                                  </div>
                                  {odontograma.notas && (
                                    <div className="text-sm text-gray-500 mt-1">
                                      {odontograma.notas.substring(0, 100)}...
                                    </div>
                                  )}
                                </div>
                                <Badge variant="outline">
                                  {odontograma.tratamientosSugeridos?.length || 0} tratamientos
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <Clock className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No hay odontogramas previos</p>
                          <p className="text-sm">Este será el primer odontograma del paciente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <User className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Paciente</h3>
                <p className="text-gray-500 text-center">
                  Busca y selecciona un paciente para visualizar o crear su odontograma
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
