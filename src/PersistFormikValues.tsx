import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { FormikValues, useFormikContext } from 'formik';
import useDebounce from 'react-use/lib/useDebounce';

export namespace PersistFormikValues {
  export interface OwnProps {
    name: string;
    debounce?: number;
    isSessionStorage?: boolean;
    // By default persisting only if form is valid
    persistInvalid?: boolean;
    hashInitials?: boolean;
  }

  export type Props = OwnProps;
}

/**
 * Hash function to do not persist different initial values
 * @param obj
 */
const getHash = (obj: any) => {
  let hc = 0;
  try {
    const chars = JSON.stringify(obj).replace(/\{|\"|\}|\:|,/g, '');
    const len = chars.length;
    for (let i = 0; i < len; i++) {
      // Bump 7 to larger prime number to increase uniqueness
      hc += chars.charCodeAt(i) * 7;
    }
  } catch (error) {
    hc = 0;
  }
  return hc;
};

// Controls is working in browser
const useBrowser = () => !!window;

const KEY_DELIMETER = '_';

const usePersistedString = (
  props: PersistFormikValues.Props
): [string | null, (values: FormikValues) => void] => {
  const { name: defaultName, isSessionStorage, hashInitials } = props;
  const isBrowser = useBrowser();
  const { initialValues } = useFormikContext<any>();

  const name = useMemo(
    () =>
      hashInitials
        ? `${defaultName}${KEY_DELIMETER}${getHash(initialValues)}`
        : defaultName,
    [defaultName, hashInitials, JSON.stringify(initialValues)]
  );

  const storage =
    isBrowser &&
    (isSessionStorage ? window.sessionStorage : window.localStorage);

  const state = useMemo(() => {
    if (storage) {
      return storage.getItem(name);
    }
    return null;
  }, [name, isSessionStorage]);

  const handlePersistValues = useCallback((values: FormikValues) => {
    if (storage) {
      storage.setItem(name, JSON.stringify(values));
      Object.keys(storage).forEach(key => {
        if (
          key.indexOf(`${defaultName}${KEY_DELIMETER}`) > -1 &&
          key !== name
        ) {
          storage.removeItem(key);
        }
      });
    }
  }, []);

  return [state, handlePersistValues];
};

const PersistFormikValuesMemo: FC<PersistFormikValues.Props> = props => {
  const { debounce = 300, persistInvalid } = props;
  const { values, setValues, isValid, initialValues } = useFormikContext<any>();
  const [persistedString, persistValues] = usePersistedString(props);
  const stringValues = JSON.stringify(values);

  const handlePersist = useCallback(() => {
    if (isValid || persistInvalid) {
      persistValues(values);
    }
  }, [stringValues, isValid, persistInvalid]);

  useEffect(() => {
    if (persistedString) {
      // Catches invalid json
      try {
        const persistedValues = JSON.parse(persistedString);
        // Initial values should be merged with persisted
        if (
          stringValues !==
          JSON.stringify({ ...initialValues, ...persistedValues })
        ) {
          setValues({ ...initialValues, ...persistedValues });
        }
      } catch (error) {
        console.error('Parse persisted values is not possible', error);
      }
    }
  }, [persistedString]);

  useDebounce(
    () => {
      handlePersist();
    },
    debounce,
    [stringValues, isValid, persistInvalid]
  );

  return null;
};

export const PersistFormikValues = memo(PersistFormikValuesMemo);

export default PersistFormikValues;
