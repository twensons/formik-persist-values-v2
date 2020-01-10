import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { PersistFormikValues } from '../src/PersistFormikValues';
import { Formik, FormikProps } from 'formik';

// tslint:disable-next-line:no-empty
const noop = () => {};

describe('Formik Persist', () => {
  it('attempts to rehydrate on mount', async () => {
    let node = document.createElement('div');
    (window as any).localStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    let injected: any;

    act(() => {
      ReactDOM.render(
        <Formik initialValues={{ name: 'jared' }} onSubmit={noop}>
          {(props: FormikProps<{ name: string }>) => {
            injected = props;
            return (
              <div>
                <PersistFormikValues name="signup" debounce={0} />
              </div>
            );
          }}
        </Formik>,
        node
      );
    });
    expect(window.localStorage.getItem).toHaveBeenCalled();

    await act(() => {
      injected.setValues({ name: 'ian' });
      return Promise.resolve();
    });

    expect(injected.values.name).toEqual('ian');
  });

  it('attempts to rehydrate on mount if session storage is true on props', async () => {
    let node = document.createElement('div');
    (window as any).sessionStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    let injected: any;

    act(() => {
      ReactDOM.render(
        <Formik initialValues={{ name: 'Anuj Sachan' }} onSubmit={noop}>
          {(props: FormikProps<{ name: string }>) => {
            injected = props;
            return (
              <div>
                <PersistFormikValues
                  name="signup"
                  debounce={0}
                  storage="sessionStorage"
                />
              </div>
            );
          }}
        </Formik>,
        node
      );
    });
    expect(window.sessionStorage.getItem).toHaveBeenCalled();
    await act(() => {
      injected.setValues({ name: 'Anuj' });
      return Promise.resolve();
    });
    expect(injected.values.name).toEqual('Anuj');
  });
});
