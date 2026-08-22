import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export async function fillLoginForm(input: {
  identifier: string;
  password: string;
  method?: 'email' | 'phone';
}) {
  const user = userEvent.setup();

  if (input.method === 'phone') {
    await user.click(screen.getByRole('button', { name: 'رقم الهاتف' }));
  }

  await user.type(
    screen.getByPlaceholderText(
      input.method === 'phone' ? '+963912345678' : 'example@email.com',
    ),
    input.identifier,
  );
  await user.type(screen.getByPlaceholderText('password123'), input.password);

  return { user };
}
