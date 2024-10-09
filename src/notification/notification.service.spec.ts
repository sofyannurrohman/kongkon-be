import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification_gateway.provider';
import { OrderService } from 'src/order/order.service';

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let notificationGateway: NotificationGateway;
  let orderService: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: NotificationGateway, useValue: mockNotificationGateway },
        { provide: OrderService, useValue: mockOrderService },
      ],
    }).compile();

    notificationService = module.get<NotificationService>(NotificationService);
    notificationGateway = module.get<NotificationGateway>(NotificationGateway);
    orderService = module.get<OrderService>(OrderService);
  });

  it('should notify customer, merchant, and driver on order matched', async () => {
    // Mock the orderService to return a fake order
    const mockOrder = { id: '1', customer_id: 'cust1', merchant_id: 'merch1' };
    orderService.findOrderById.mockResolvedValue(mockOrder);

    const msg = { orderId: '1', driverId: 'driver1' };
    await notificationService.handleOrderMatchedMessage(msg);

    // Check if all notifications were sent
    expect(notificationGateway.notifyCustomer).toHaveBeenCalledWith(
      'cust1',
      expect.any(Object),
    );
    expect(notificationGateway.notifyMerchant).toHaveBeenCalledWith(
      'merch1',
      expect.any(Object),
    );
    expect(notificationGateway.notifyDriver).toHaveBeenCalledWith(
      'driver1',
      expect.any(Object),
    );
  });
});
