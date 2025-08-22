
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInventory() {
  console.log('🌱 Iniciando seed del inventario...');

  try {
    // Crear ubicaciones por defecto
    console.log('📍 Creando ubicaciones...');
    const almacenPrincipal = await prisma.location.upsert({
      where: { code: 'ALM-001' },
      update: {},
      create: {
        code: 'ALM-001',
        name: 'Almacén Principal',
        type: 'ALMACEN',
        description: 'Almacén principal de la clínica',
        isDefault: true,
        isActive: true
      }
    });

    const gabinete1 = await prisma.location.upsert({
      where: { code: 'GAB-001' },
      update: {},
      create: {
        code: 'GAB-001',
        name: 'Gabinete 1',
        type: 'GABINETE',
        description: 'Gabinete dental número 1',
        room: '101',
        isActive: true
      }
    });

    const gabinete2 = await prisma.location.upsert({
      where: { code: 'GAB-002' },
      update: {},
      create: {
        code: 'GAB-002',
        name: 'Gabinete 2',
        type: 'GABINETE',
        description: 'Gabinete dental número 2',
        room: '102',
        isActive: true
      }
    });

    const farmacia = await prisma.location.upsert({
      where: { code: 'FAR-001' },
      update: {},
      create: {
        code: 'FAR-001',
        name: 'Farmacia',
        type: 'FARMACIA',
        description: 'Área de medicamentos y farmacia',
        isActive: true
      }
    });

    // Crear proveedores por defecto
    console.log('🏢 Creando proveedores...');
    const proveedor1 = await prisma.supplier.upsert({
      where: { code: 'PROV-001' },
      update: {},
      create: {
        code: 'PROV-001',
        name: 'Dental Supply Co.',
        commercialName: 'Dental Supply',
        contactPerson: 'Juan Pérez',
        phone: '+52 55 1234 5678',
        email: 'ventas@dentalsupply.com',
        address: 'Av. Reforma 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        country: 'México',
        paymentTerms: '30 días',
        deliveryDays: 5,
        rating: 5,
        isActive: true,
        isPreferred: true
      }
    });

    const proveedor2 = await prisma.supplier.upsert({
      where: { code: 'PROV-002' },
      update: {},
      create: {
        code: 'PROV-002',
        name: 'Materiales Dentales SA',
        commercialName: 'MatDental',
        contactPerson: 'María González',
        phone: '+52 55 9876 5432',
        email: 'pedidos@matdental.com',
        address: 'Calle Insurgentes 456',
        city: 'Guadalajara',
        state: 'Jalisco',
        country: 'México',
        paymentTerms: '15 días',
        deliveryDays: 3,
        rating: 4,
        isActive: true
      }
    });

    const proveedor3 = await prisma.supplier.upsert({
      where: { code: 'PROV-003' },
      update: {},
      create: {
        code: 'PROV-003',
        name: 'Farmacia Dental Ltda',
        commercialName: 'FarmaDental',
        contactPerson: 'Carlos Rodríguez',
        phone: '+52 81 2468 1357',
        email: 'contacto@farmadental.com',
        address: 'Blvd. Constitución 789',
        city: 'Monterrey',
        state: 'Nuevo León',
        country: 'México',
        paymentTerms: '45 días',
        deliveryDays: 7,
        rating: 4,
        isActive: true
      }
    });

    // Crear productos de ejemplo
    console.log('📦 Creando productos...');
    
    // Materiales dentales
    const amalgama = await prisma.product.upsert({
      where: { sku: 'MAT-001' },
      update: {},
      create: {
        sku: 'MAT-001',
        code: 'AMAL-001',
        name: 'Amalgama Dental Regular',
        description: 'Amalgama dental para restauraciones posteriores',
        category: 'MATERIALES_DENTALES',
        subcategory: 'Restaurativos',
        brand: 'DentalCorp',
        model: 'Regular',
        unit: 'GRAMO',
        presentation: 'Frasco de 50g',
        purchasePrice: 25.50,
        averageCost: 25.50,
        salePrice: 35.00,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 15,
        supplierId: proveedor1.id,
        supplierCode: 'DC-AMAL-001',
        isActive: true,
        isConsumable: true
      }
    });

    const resina = await prisma.product.upsert({
      where: { sku: 'MAT-002' },
      update: {},
      create: {
        sku: 'MAT-002',
        code: 'RES-001',
        name: 'Resina Compuesta A2',
        description: 'Resina compuesta fotopolimerizable color A2',
        category: 'MATERIALES_DENTALES',
        subcategory: 'Restaurativos',
        brand: 'CompoFill',
        model: 'Universal A2',
        unit: 'UNIDAD',
        presentation: 'Jeringa de 4g',
        purchasePrice: 45.00,
        averageCost: 45.00,
        salePrice: 65.00,
        minStock: 20,
        maxStock: 200,
        reorderPoint: 30,
        supplierId: proveedor1.id,
        supplierCode: 'CF-RES-A2',
        isActive: true,
        isConsumable: true
      }
    });

    const anestesia = await prisma.product.upsert({
      where: { sku: 'MED-001' },
      update: {},
      create: {
        sku: 'MED-001',
        code: 'ANES-001',
        name: 'Lidocaína 2% con Epinefrina',
        description: 'Anestésico local para procedimientos dentales',
        category: 'MEDICAMENTOS',
        subcategory: 'Anestésicos',
        brand: 'AnesteDent',
        model: '2% Epi',
        unit: 'UNIDAD',
        presentation: 'Cartucho de 1.8ml',
        purchasePrice: 8.50,
        averageCost: 8.50,
        salePrice: 15.00,
        minStock: 50,
        maxStock: 500,
        reorderPoint: 75,
        supplierId: proveedor3.id,
        supplierCode: 'AD-LID-2E',
        hasExpiration: true,
        isActive: true,
        isConsumable: true
      }
    });

    // Instrumental
    const espejo = await prisma.product.upsert({
      where: { sku: 'INS-001' },
      update: {},
      create: {
        sku: 'INS-001',
        code: 'ESP-001',
        name: 'Espejo Dental #5',
        description: 'Espejo dental número 5 con mango',
        category: 'INSTRUMENTAL',
        subcategory: 'Básico',
        brand: 'InstruDent',
        model: 'Clásico #5',
        unit: 'UNIDAD',
        presentation: 'Pieza individual',
        purchasePrice: 15.00,
        averageCost: 15.00,
        salePrice: 25.00,
        minStock: 5,
        maxStock: 50,
        reorderPoint: 10,
        supplierId: proveedor2.id,
        supplierCode: 'ID-ESP-05',
        isActive: true,
        isConsumable: false
      }
    });

    const sonda = await prisma.product.upsert({
      where: { sku: 'INS-002' },
      update: {},
      create: {
        sku: 'INS-002',
        code: 'SON-001',
        name: 'Sonda Periodontal',
        description: 'Sonda periodontal graduada para medición de bolsas',
        category: 'INSTRUMENTAL',
        subcategory: 'Periodoncia',
        brand: 'PerioTools',
        model: 'Graduada',
        unit: 'UNIDAD',
        presentation: 'Pieza individual',
        purchasePrice: 22.00,
        averageCost: 22.00,
        salePrice: 35.00,
        minStock: 3,
        maxStock: 30,
        reorderPoint: 5,
        supplierId: proveedor2.id,
        supplierCode: 'PT-SON-001',
        isActive: true,
        isConsumable: false
      }
    });

    // Consumibles
    const guantes = await prisma.product.upsert({
      where: { sku: 'CON-001' },
      update: {},
      create: {
        sku: 'CON-001',
        code: 'GUA-001',
        name: 'Guantes de Nitrilo Talla M',
        description: 'Guantes desechables de nitrilo sin polvo',
        category: 'CONSUMIBLES',
        subcategory: 'Protección',
        brand: 'SafeHands',
        model: 'Nitrilo M',
        unit: 'CAJA',
        presentation: 'Caja de 100 unidades',
        purchasePrice: 35.00,
        averageCost: 35.00,
        salePrice: 50.00,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 20,
        supplierId: proveedor1.id,
        supplierCode: 'SH-NIT-M',
        isActive: true,
        isConsumable: true
      }
    });

    const mascarillas = await prisma.product.upsert({
      where: { sku: 'CON-002' },
      update: {},
      create: {
        sku: 'CON-002',
        code: 'MAS-001',
        name: 'Mascarillas Quirúrgicas',
        description: 'Mascarillas desechables de 3 capas',
        category: 'CONSUMIBLES',
        subcategory: 'Protección',
        brand: 'MedProtect',
        model: '3 Capas',
        unit: 'CAJA',
        presentation: 'Caja de 50 unidades',
        purchasePrice: 18.00,
        averageCost: 18.00,
        salePrice: 28.00,
        minStock: 15,
        maxStock: 150,
        reorderPoint: 25,
        supplierId: proveedor1.id,
        supplierCode: 'MP-MAS-3C',
        isActive: true,
        isConsumable: true
      }
    });

    // Crear stock inicial en ubicaciones
    console.log('📊 Creando stock inicial...');
    
    const productos = [amalgama, resina, anestesia, espejo, sonda, guantes, mascarillas];
    
    for (const producto of productos) {
      // Stock en almacén principal
      const stockAlmacen = Math.floor(Math.random() * 50) + 20; // Entre 20 y 70
      await prisma.stock.create({
        data: {
          productId: producto.id,
          locationId: almacenPrincipal.id,
          quantity: stockAlmacen,
          available: stockAlmacen,
          unitCost: producto.purchasePrice,
          totalValue: stockAlmacen * producto.purchasePrice
        }
      });

      // Stock en gabinetes (menor cantidad)
      if (producto.category === 'CONSUMIBLES' || producto.category === 'MEDICAMENTOS') {
        const stockGab1 = Math.floor(Math.random() * 10) + 5; // Entre 5 y 15
        await prisma.stock.create({
          data: {
            productId: producto.id,
            locationId: gabinete1.id,
            quantity: stockGab1,
            available: stockGab1,
            unitCost: producto.purchasePrice,
            totalValue: stockGab1 * producto.purchasePrice
          }
        });

        const stockGab2 = Math.floor(Math.random() * 10) + 5; // Entre 5 y 15
        await prisma.stock.create({
          data: {
            productId: producto.id,
            locationId: gabinete2.id,
            quantity: stockGab2,
            available: stockGab2,
            unitCost: producto.purchasePrice,
            totalValue: stockGab2 * producto.purchasePrice
          }
        });
      }

      // Actualizar stock total del producto
      const totalStock = await prisma.stock.aggregate({
        where: { productId: producto.id },
        _sum: { quantity: true }
      });

      await prisma.product.update({
        where: { id: producto.id },
        data: { totalStock: totalStock._sum.quantity || 0 }
      });
    }

    // Crear algunos movimientos de ejemplo
    console.log('📝 Creando movimientos de ejemplo...');
    
    // Obtener un usuario admin para los movimientos
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminUser) {
      // Movimiento de entrada para amalgama
      await prisma.inventoryMovement.create({
        data: {
          productId: amalgama.id,
          locationId: almacenPrincipal.id,
          type: 'ENTRADA',
          subtype: 'COMPRA',
          quantity: 20,
          quantityBefore: 0,
          quantityAfter: 20,
          unitCost: 25.50,
          totalCost: 510.00,
          description: 'Compra inicial de amalgama',
          reference: 'FAC-001',
          userId: adminUser.id
        }
      });

      // Movimiento de salida para guantes
      await prisma.inventoryMovement.create({
        data: {
          productId: guantes.id,
          locationId: almacenPrincipal.id,
          type: 'SALIDA',
          subtype: 'USO_TRATAMIENTO',
          quantity: -2,
          quantityBefore: 30,
          quantityAfter: 28,
          description: 'Uso en tratamientos del día',
          userId: adminUser.id
        }
      });
    }

    // Crear algunas alertas de ejemplo
    console.log('🚨 Creando alertas de ejemplo...');
    
    // Alerta de stock bajo para anestesia
    await prisma.inventoryAlert.create({
      data: {
        productId: anestesia.id,
        type: 'stock_bajo',
        message: `El producto ${anestesia.name} tiene stock bajo (45 unidades, mínimo: 50)`,
        priority: 'Alta'
      }
    });

    // Alerta de stock bajo para espejo
    await prisma.inventoryAlert.create({
      data: {
        productId: espejo.id,
        type: 'stock_bajo',
        message: `El producto ${espejo.name} tiene stock bajo (4 unidades, mínimo: 5)`,
        priority: 'Normal'
      }
    });

    console.log('✅ Seed del inventario completado exitosamente!');
    console.log(`📍 Ubicaciones creadas: ${[almacenPrincipal, gabinete1, gabinete2, farmacia].length}`);
    console.log(`🏢 Proveedores creados: ${[proveedor1, proveedor2, proveedor3].length}`);
    console.log(`📦 Productos creados: ${productos.length}`);

  } catch (error) {
    console.error('❌ Error durante el seed del inventario:', error);
    throw error;
  }
}

export default seedInventory;

// Ejecutar si se llama directamente
if (require.main === module) {
  seedInventory()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
