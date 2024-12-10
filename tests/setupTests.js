import { setupServer } from 'msw/node';
import { rest } from 'msw';
import '@testing-library/jest-dom';

const server = setupServer(
  rest.post('/api/tasks', (req, res, ctx) => {
    return res(ctx.json({ id: 1, title: 'Test Task', difficulty: 2 }));
  }),
  rest.delete('/api/tasks/:id', (req, res, ctx) => {
    return res(ctx.json({ message: 'Task deleted successfully' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
