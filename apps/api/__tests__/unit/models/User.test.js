const User = require('../../../models/User');

describe('User Model', () => {
  it('should hash password before saving', async () => {
    // Create test user
    const userData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const user = new User(userData);
    await user.save();

    // Password should be hashed
    expect(user.password).not.toBe('password123');
    expect(user.password).toHaveLength(60); // bcrypt hash length
  });

  it('should compare password correctly', async () => {
    // Create test user
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
    });
    await user.save();

    // Test password comparison
    const validPassword = await user.comparePassword('password123');
    const invalidPassword = await user.comparePassword('wrongpassword');

    expect(validPassword).toBe(true);
    expect(invalidPassword).toBe(false);
  });

  it('should generate reset token', () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123',
    });

    const token = user.generateResetToken();

    expect(token).toBeDefined();
    expect(user.resetPasswordToken).toBe(token);
    expect(user.resetPasswordExpires).toBeInstanceOf(Date);

    // Should expire 1 hour in the future
    const hourFromNow = new Date(Date.now() + 3600000);
    const fiveMinuteWindow = 5 * 60 * 1000;

    expect(user.resetPasswordExpires.getTime()).toBeGreaterThan(
      hourFromNow.getTime() - fiveMinuteWindow,
    );
    expect(user.resetPasswordExpires.getTime()).toBeLessThan(
      hourFromNow.getTime() + fiveMinuteWindow,
    );
  });
});
