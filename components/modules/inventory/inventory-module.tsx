
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Eye,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  BarChart3,
  Filter
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Helper function para formatear precios de manera segura
const formatPrice = (price: any): string => {
  if (typeof price === 'number' && !isNaN(price)) {
    return price.toFixed(2);
  }
  return '0.00';
};

interface Product {
  id: string;
  name: string;
  code: string;
  category: string;
  brand?: string;
  description?: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice: number;
  costPrice: number;
  supplier?: string;
  location?: string;
  expirationDate?: string;
  status: 'Activo' | 'Inactivo' | 'Descontinuado';
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: 'Entrada' | 'Salida' | 'Ajuste';
  quantity: number;
  reason: string;
  userId: string;
  createdAt: string;
}

export function InventoryModule() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Simulando datos de inventario
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Amalgama de Plata',
          code: 'AML-001',
          category: 'Materiales Restaurativos',
          brand: 'DentalCorp',
          description: 'Amalgama de plata para restauraciones dentales',
          currentStock: 15,
          minStock: 10,
          maxStock: 50,
          unitPrice: 25.00,
          costPrice: 18.50,
          supplier: 'Distribuidora Dental SA',
          location: 'Estante A-1',
          status: 'Activo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Resina Compuesta',
          code: 'RES-002',
          category: 'Materiales Restaurativos',
          brand: 'DentalLux',
          description: 'Resina compuesta fotocurable color A2',
          currentStock: 5,
          minStock: 8,
          maxStock: 30,
          unitPrice: 45.00,
          costPrice: 32.00,
          supplier: 'Dental Supplies Inc',
          location: 'Estante B-2',
          status: 'Activo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Anestésico Lidocaína 2%',
          code: 'ANE-003',
          category: 'Anestésicos',
          brand: 'MediDent',
          description: 'Anestésico local con epinefrina',
          currentStock: 25,
          minStock: 15,
          maxStock: 60,
          unitPrice: 8.50,
          costPrice: 6.20,
          supplier: 'Farmacéutica Dental',
          location: 'Refrigerador A',
          expirationDate: '2024-12-31',
          status: 'Activo',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Product['status']) => {
    const statusConfig = {
      'Activo': { variant: 'success', label: 'Activo' },
      'Inactivo': { variant: 'secondary', label: 'Inactivo' },
      'Descontinuado': { variant: 'destructive', label: 'Descontinuado' }
    };
    
    const config = statusConfig[status] || statusConfig['Inactivo'];
    
    return (
      <Badge variant={config.variant as any}>
        {config.label}
      </Badge>
    );
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStock) {
      return { status: 'low', color: 'text-red-600', icon: TrendingDown };
    } else if (product.currentStock >= product.maxStock * 0.8) {
      return { status: 'high', color: 'text-green-600', icon: TrendingUp };
    } else {
      return { status: 'normal', color: 'text-blue-600', icon: Package };
    }
  };

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    let matchesStock = true;
    if (stockFilter === 'low') {
      matchesStock = product.currentStock <= product.minStock;
    } else if (stockFilter === 'high') {
      matchesStock = product.currentStock >= product.maxStock * 0.8;
    } else if (stockFilter === 'normal') {
      matchesStock = product.currentStock > product.minStock && product.currentStock < product.maxStock * 0.8;
    }
    
    return matchesSearch && matchesCategory && matchesStatus && matchesStock;
  });

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);
  const totalValue = products.reduce((sum, p) => sum + (p.currentStock * p.costPrice), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold dental-text-primary">Inventario</h1>
          <p className="text-gray-600">Gestión de materiales y productos dentales</p>
        </div>
        <Button onClick={() => setIsNewProductOpen(true)} className="dental-gradient">
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-gray-500">Productos registrados</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">Valor del inventario</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {lowStockProducts.length}
            </div>
            <p className="text-xs text-gray-500">Productos con stock bajo</p>
          </CardContent>
        </Card>

        <Card className="dental-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-gray-500">Categorías diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <Card className="dental-card border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Productos con Stock Bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center">
                  <span className="font-medium">{product.name}</span>
                  <Badge variant="destructive">
                    {product.currentStock} / {product.minStock} mín.
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Buscar por nombre, código o marca..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full lg:w-48">
              <Label htmlFor="category">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <Label htmlFor="status">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Descontinuado">Descontinuado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full lg:w-48">
              <Label htmlFor="stock">Stock</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Nivel de stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los niveles</SelectItem>
                  <SelectItem value="low">Stock bajo</SelectItem>
                  <SelectItem value="normal">Stock normal</SelectItem>
                  <SelectItem value="high">Stock alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products List */}
      <Card className="dental-card">
        <CardHeader>
          <CardTitle className="text-lg">Lista de Productos</CardTitle>
          <p className="text-sm text-gray-600">
            Se encontraron {filteredProducts.length} productos
          </p>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No se encontraron productos</p>
              <Button onClick={() => setIsNewProductOpen(true)} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Agregar primer producto
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const stockInfo = getStockStatus(product);
                const StockIcon = stockInfo.icon;

                return (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleProductClick(product)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg dental-text-primary">
                          {product.name}
                        </h3>
                        <p className="text-gray-600">
                          Código: {product.code}
                          {product.brand && (
                            <span className="ml-2 text-gray-400">| {product.brand}</span>
                          )}
                        </p>
                        <Badge variant="secondary" className="mt-1">
                          {product.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(product.status)}
                        <div className="mt-2">
                          <div className={`flex items-center gap-1 ${stockInfo.color}`}>
                            <StockIcon className="w-4 h-4" />
                            <span className="font-semibold">
                              {product.currentStock} unidades
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Stock mínimo:</span>
                        <span className="ml-1">{product.minStock}</span>
                      </div>
                      <div>
                        <span className="font-medium">Precio:</span>
                        <span className="ml-1">${formatPrice(product.unitPrice)}</span>
                      </div>
                      <div>
                        <span className="font-medium">Ubicación:</span>
                        <span className="ml-1">{product.location || 'No definida'}</span>
                      </div>
                      <div>
                        <span className="font-medium">Proveedor:</span>
                        <span className="ml-1">{product.supplier || 'No definido'}</span>
                      </div>
                    </div>

                    {product.description && (
                      <p className="text-gray-600 mt-2 text-sm line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {selectedProduct?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Información</TabsTrigger>
                <TabsTrigger value="stock">Stock</TabsTrigger>
                <TabsTrigger value="movements">Movimientos</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Información del Producto</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Nombre</p>
                        <p className="font-medium">{selectedProduct.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Código</p>
                        <p className="font-medium">{selectedProduct.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Categoría</p>
                        <Badge variant="secondary">{selectedProduct.category}</Badge>
                      </div>
                      {selectedProduct.brand && (
                        <div>
                          <p className="text-sm text-gray-500">Marca</p>
                          <p className="font-medium">{selectedProduct.brand}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
                        {getStatusBadge(selectedProduct.status)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Precios y Proveedor</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Precio de Venta</p>
                        <p className="font-medium">${formatPrice(selectedProduct.unitPrice)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Precio de Costo</p>
                        <p className="font-medium">${formatPrice(selectedProduct.costPrice)}</p>
                      </div>
                      {selectedProduct.supplier && (
                        <div>
                          <p className="text-sm text-gray-500">Proveedor</p>
                          <p className="font-medium">{selectedProduct.supplier}</p>
                        </div>
                      )}
                      {selectedProduct.location && (
                        <div>
                          <p className="text-sm text-gray-500">Ubicación</p>
                          <p className="font-medium">{selectedProduct.location}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedProduct.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Descripción</h3>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded">
                      {selectedProduct.description}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="stock" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Niveles de Stock</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Stock Actual</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {selectedProduct.currentStock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Mínimo</span>
                        <span className="font-medium text-red-600">
                          {selectedProduct.minStock}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Máximo</span>
                        <span className="font-medium text-green-600">
                          {selectedProduct.maxStock}
                        </span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Nivel de Stock</span>
                          <span>
                            {Math.round((selectedProduct.currentStock / selectedProduct.maxStock) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              selectedProduct.currentStock <= selectedProduct.minStock 
                                ? 'bg-red-600' 
                                : 'bg-blue-600'
                            }`}
                            style={{ 
                              width: `${Math.min(
                                (selectedProduct.currentStock / selectedProduct.maxStock) * 100, 
                                100
                              )}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Valor del Inventario</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Valor de Costo</span>
                        <span className="font-bold">
                          ${formatPrice(selectedProduct.currentStock * selectedProduct.costPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor de Venta</span>
                        <span className="font-bold">
                          ${formatPrice(selectedProduct.currentStock * selectedProduct.unitPrice)}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Ganancia Potencial</span>
                        <span className="font-bold">
                          ${formatPrice((selectedProduct.unitPrice - selectedProduct.costPrice) * selectedProduct.currentStock)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Stock
                  </Button>
                  <Button variant="outline">
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Registrar Salida
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="movements" className="space-y-4">
                <div className="text-center py-8">
                  <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-2">Historial de Movimientos</p>
                  <p className="text-sm text-gray-400 mb-4">
                    Funcionalidad en desarrollo
                  </p>
                  <p className="text-sm text-gray-400">
                    Próximamente podrás ver todos los movimientos de entrada y salida del producto
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* New Product Dialog */}
      <Dialog open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              Formulario de registro de producto en desarrollo
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Esta funcionalidad estará disponible próximamente
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
