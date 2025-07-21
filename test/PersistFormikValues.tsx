import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { PersistFormikValues } from '../src/PersistFormikValues';
import { Formik } from 'formik';

// tslint:disable-next-line:no-empty
const noop = () => {};

// Mock window object for tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
  writable: true,
});

describe('Formik Persist', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', async () => {
    const node = document.createElement('div');

    await act(async () => {
      const root = createRoot(node);
      root.render(
        <Formik initialValues={{ name: 'test' }} onSubmit={noop}>
          {() => (
            <div>
              <PersistFormikValues name="test-form" />
            </div>
          )}
        </Formik>
      );
    });

    expect(node).toBeDefined();
  });

  it('calls localStorage getItem on mount', async () => {
    const node = document.createElement('div');
    const mockGetItem = jest.fn().mockReturnValue(null);
    (window.localStorage.getItem as jest.Mock) = mockGetItem;

    await act(async () => {
      const root = createRoot(node);
      root.render(
        <Formik initialValues={{ name: 'jared' }} onSubmit={noop}>
          {() => (
            <div>
              <PersistFormikValues name="signup" debounce={0} />
            </div>
          )}
        </Formik>
      );

      // Wait for effects to run
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockGetItem).toHaveBeenCalled();
  });

  it('works with sessionStorage', async () => {
    const node = document.createElement('div');
    const mockGetItem = jest.fn().mockReturnValue(null);
    (window.sessionStorage.getItem as jest.Mock) = mockGetItem;

    await act(async () => {
      const root = createRoot(node);
      root.render(
        <Formik initialValues={{ name: 'test' }} onSubmit={noop}>
          {() => (
            <div>
              <PersistFormikValues
                name="signup"
                storage="sessionStorage"
                debounce={0}
              />
            </div>
          )}
        </Formik>
      );

      // Wait for effects to run
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockGetItem).toHaveBeenCalled();
  });
});
