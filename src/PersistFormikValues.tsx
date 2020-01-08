import * as React from 'react';

import { FormikValues, useFormikContext } from 'formik';
import useDebounce from 'react-use/lib/useDebounce';

export namespace PersistFormikValues {
  export interface OwnProps {
    name: string;
    debounce?: number;
    isSessionStorage?: boolean;
    // By default persisting only if form is valid
    persistInvalid?: boolean;
  }

  export type Props = OwnProps;
}

// Controls is working in browser
const useBrowser = () => !!window;

const usePersistedString = (
  props: PersistFormikValues.Props
): [string | null, (values: FormikValues) => void] => {
  const { name, isSessionStorage } = props;
  const isBrowser = useBrowser();
  const state = React.useMemo(() => {
    if (isBrowser) {
      if (isSessionStorage) {
        return window.sessionStorage.getItem(name);
      } else {
        return window.localStorage.getItem(name);
      }
    }
    return null;
  }, [name, isSessionStorage]);

  const handlePersistValues = React.useCallback((values: FormikValues) => {
    if (isBrowser) {
      if (isSessionStorage) {
        window.sessionStorage.setItem(name, JSON.stringify(values));
      } else {
        window.localStorage.setItem(name, JSON.stringify(values));
      }
    }
  }, []);

  try {
    if (!!state) {
      return [state, handlePersistValues];
    }
  } catch (error) {
    return [null, handlePersistValues];
  }

  return [null, handlePersistValues];
};

const PersistFormikValuesMemo: React.FC<PersistFormikValues.Props> = props => {
  const { debounce = 300, persistInvalid } = props;
  const { values, setValues, isValid } = useFormikContext<any>();
  const [persistedString, persistValues] = usePersistedString(props);

  React.useEffect(() => {
    if (persistedString) {
      try {
        const persistedValues = JSON.parse(persistedString);
        setValues(persistedValues);
      } catch (error) {
        console.error('Parse persisted values is not possible', error);
      }
    }
  }, [persistedString]);

  useDebounce(
    () => {
      if (isValid || persistInvalid) {
        persistValues(values);
      }
    },
    debounce,
    [JSON.stringify(values), isValid, persistInvalid]
  );

  return null;
};

export const PersistFormikValues = React.memo(PersistFormikValuesMemo);

export default PersistFormikValues;
