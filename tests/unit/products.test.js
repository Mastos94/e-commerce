/**
 * Product Service Tests
 */

const productService = require('../src/services/ProductService');
const productRepository = require('../src/repositories/ProductRepository');

// Mock product repository
jest.mock('../src/repositories/ProductRepository');

describe('Product Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      const mockProducts = {
        data: [
          { _id: '1', name: 'Product 1', price: 10 },
          { _id: '2', name: 'Product 2', price: 20 }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 2,
          itemsPerPage: 10
        }
      };

      productRepository.search.mockResolvedValue(mockProducts);

      const result = await productService.getProducts({ page: 1, limit: 10 });

      expect(productRepository.search).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      const mockProduct = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test Product',
        price: 29.99
      };

      productRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getProductById('507f1f77bcf86cd799439011');

      expect(productRepository.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.findById.mockResolvedValue(null);

      await expect(
        productService.getProductById('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'Test description',
        price: 19.99,
        category: 'Electronics',
        stock: 100
      };

      const mockProduct = { _id: '1', ...productData };
      productRepository.create.mockResolvedValue(mockProduct);

      const result = await productService.createProduct(productData);

      expect(productRepository.create).toHaveBeenCalledWith(productData);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update product when found', async () => {
      const updateData = { name: 'Updated Product' };
      const mockProduct = { _id: '1', ...updateData };

      productRepository.updateById.mockResolvedValue(mockProduct);

      const result = await productService.updateProduct('1', updateData);

      expect(productRepository.updateById).toHaveBeenCalledWith('1', updateData);
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.updateById.mockResolvedValue(null);

      await expect(
        productService.updateProduct('1', { name: 'Test' })
      ).rejects.toThrow('Product not found');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product when found', async () => {
      const mockProduct = { _id: '1', name: 'Product' };
      productRepository.deleteById.mockResolvedValue(mockProduct);

      const result = await productService.deleteProduct('1');

      expect(productRepository.deleteById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProduct);
    });

    it('should throw error when product not found', async () => {
      productRepository.deleteById.mockResolvedValue(null);

      await expect(
        productService.deleteProduct('1')
      ).rejects.toThrow('Product not found');
    });
  });
});
