// src/utils/test-service-integration.ts

import ServiceService, { CreateServiceInput, ServiceType, ServiceQuality } from '@/services/service-service';

export const testServiceIntegration = async () => {
  console.log('🧪 Testing Service Integration...');
  
  const testResults = {
    validation: false,
    createService: false,
    updateService: false,
    deleteService: false,
    supplierServices: false,
    errors: [] as string[]
  };

  try {
    // Test 1: Validation
    console.log('Testing validation...');
    const validService: CreateServiceInput = {
      name: 'Test Instagram Followers',
      type: 'followers',
      quality: 'general',
      supplierServiceId: '2183',
      description: 'Test service for integration testing',
      price: 2.99,
      supplierPrice: 1.50,
      minQuantity: 100,
      maxQuantity: 1000,
      deliverySpeed: '24-48 hours',
      active: true
    };

    const validation = ServiceService.validateServiceData(validService);
    if (validation.isValid) {
      testResults.validation = true;
      console.log('✅ Validation test passed');
    } else {
      testResults.errors.push(`Validation failed: ${validation.errors.join(', ')}`);
      console.log('❌ Validation test failed:', validation.errors);
    }

    // Test 2: Supplier Service ID helper
    console.log('Testing supplier service ID helper...');
    const serviceId = ServiceService.getSupplierServiceId('followers', 'general');
    if (serviceId === '2183') {
      console.log('✅ Supplier service ID helper test passed');
    } else {
      testResults.errors.push(`Supplier service ID helper failed: expected 2183, got ${serviceId}`);
      console.log('❌ Supplier service ID helper test failed');
    }

    // Test 3: Fetch services
    console.log('Testing fetch services...');
    try {
      const services = await ServiceService.getAllServices();
      console.log(`✅ Fetch services test passed - found ${services.length} services`);
    } catch (error: any) {
      testResults.errors.push(`Fetch services failed: ${error.message}`);
      console.log('❌ Fetch services test failed:', error.message);
    }

    // Test 4: Fetch supplier services
    console.log('Testing fetch supplier services...');
    try {
      const supplierServices = await ServiceService.getSupplierServices();
      console.log(`✅ Fetch supplier services test passed - found ${supplierServices.length} services`);
      testResults.supplierServices = true;
    } catch (error: any) {
      testResults.errors.push(`Fetch supplier services failed: ${error.message}`);
      console.log('❌ Fetch supplier services test failed:', error.message);
    }

    // Test 5: Create service (if validation passed)
    if (testResults.validation) {
      console.log('Testing create service...');
      try {
        const createdService = await ServiceService.createService(validService);
        testResults.createService = true;
        console.log('✅ Create service test passed');
        
        // Test 6: Update service
        console.log('Testing update service...');
        const updateData = {
          name: 'Updated Test Service',
          price: 3.99
        };
        
        const updatedService = await ServiceService.updateService(createdService._id, updateData);
        if (updatedService.name === 'Updated Test Service' && updatedService.price === 3.99) {
          testResults.updateService = true;
          console.log('✅ Update service test passed');
        } else {
          testResults.errors.push('Update service test failed - service not updated correctly');
          console.log('❌ Update service test failed');
        }

        // Test 7: Delete service
        console.log('Testing delete service...');
        const deleteSuccess = await ServiceService.deleteService(createdService._id);
        if (deleteSuccess) {
          testResults.deleteService = true;
          console.log('✅ Delete service test passed');
        } else {
          testResults.errors.push('Delete service test failed');
          console.log('❌ Delete service test failed');
        }
      } catch (error: any) {
        testResults.errors.push(`Create/Update/Delete service failed: ${error.message}`);
        console.log('❌ Create/Update/Delete service test failed:', error.message);
      }
    }

  } catch (error: any) {
    testResults.errors.push(`Integration test failed: ${error.message}`);
    console.log('❌ Integration test failed:', error.message);
  }

  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log(`Validation: ${testResults.validation ? '✅' : '❌'}`);
  console.log(`Create Service: ${testResults.createService ? '✅' : '❌'}`);
  console.log(`Update Service: ${testResults.updateService ? '✅' : '❌'}`);
  console.log(`Delete Service: ${testResults.deleteService ? '✅' : '❌'}`);
  console.log(`Supplier Services: ${testResults.supplierServices ? '✅' : '❌'}`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ Errors found:');
    testResults.errors.forEach(error => console.log(`- ${error}`));
  } else {
    console.log('\n🎉 All tests passed! Service integration is working correctly.');
  }

  return testResults;
};

// Test different service types
export const testAllServiceTypes = async () => {
  console.log('\n🧪 Testing All Service Types...');
  
  const serviceTypes: Array<{ type: ServiceType; quality: ServiceQuality; supplierId: string }> = [
    { type: 'followers', quality: 'general', supplierId: '2183' },
    { type: 'followers', quality: 'premium', supplierId: '3305' },
    { type: 'likes', quality: 'general', supplierId: '1782' },
    { type: 'likes', quality: 'premium', supplierId: '1761' },
    { type: 'views', quality: 'general', supplierId: '8577' },
    { type: 'views', quality: 'premium', supplierId: '340' },
    { type: 'comments', quality: 'general', supplierId: '1234' },
    { type: 'comments', quality: 'premium', supplierId: '5678' }
  ];

  for (const serviceConfig of serviceTypes) {
    console.log(`Testing ${serviceConfig.type} (${serviceConfig.quality})...`);
    
    const testService: CreateServiceInput = {
      name: `Test ${serviceConfig.type} ${serviceConfig.quality}`,
      type: serviceConfig.type,
      quality: serviceConfig.quality,
      supplierServiceId: serviceConfig.supplierId,
      description: `Test ${serviceConfig.type} service`,
      price: 2.99,
      supplierPrice: 1.50,
      minQuantity: 100,
      maxQuantity: 1000,
      deliverySpeed: '24-48 hours',
      active: true
    };

    try {
      const validation = ServiceService.validateServiceData(testService);
      if (!validation.isValid) {
        console.log(`❌ ${serviceConfig.type} (${serviceConfig.quality}) validation failed:`, validation.errors);
        continue;
      }

      const createdService = await ServiceService.createService(testService);
      console.log(`✅ ${serviceConfig.type} (${serviceConfig.quality}) created successfully`);
      
      // Clean up
      await ServiceService.deleteService(createdService._id);
      console.log(`✅ ${serviceConfig.type} (${serviceConfig.quality}) deleted successfully`);
    } catch (error: any) {
      console.log(`❌ ${serviceConfig.type} (${serviceConfig.quality}) failed:`, error.message);
    }
  }
  
  console.log('\n🎉 Service type testing completed!');
}; 