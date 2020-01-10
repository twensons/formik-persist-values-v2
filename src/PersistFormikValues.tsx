import { FC, memo, useCallback, useEffect, useMemo } from 'react';

import { FormikValues, useFormikContext } from 'formik';
import useDebounce from 'react-use/lib/useDebounce';
import omit from 'lodash.omit';

const KEY_DELIMITER = '_';

export interface PersistFormikValuesProps {
  name: string;
  // Debounce in ms
  debounce?: number;
  // Possible provide own storage
  storage?: 'localStorage' | 'sessionStorage' | Storage;
  // By default persisting only if form is valid
  persistInvalid?: boolean;
  // Hash form initial values for storage key generation
  hashInitials?: boolean;
  // List of not persisted values
  ignoreValues?: string[];
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

const useStorage = (props: PersistFormikValuesProps): Storage | undefined => {
  const { storage = 'localStorage' } = props;
  const isBrowser = useBrowser();

  switch (storage) {
    case 'sessionStorage':
      return isBrowser ? window.sessionStorage : undefined;
    case 'localStorage':
      return isBrowser ? window.localStorage : undefined;
    default:
      return storage;
  }
};

const usePersistedString = (
  props: PersistFormikValuesProps
): [string | null, (values: FormikValues) => void] => {
  const { name: defaultName, hashInitials } = props;
  const { initialValues } = useFormikContext<any>();
  const keyName = `${defaultName}${KEY_DELIMITER}`;

  const name = useMemo(
    () => (hashInitials ? `${keyName}${getHash(initialValues)}` : defaultName),
    [defaultName, hashInitials, JSON.stringify(initialValues)]
  );

  const storage = useStorage(props);

  const state = useMemo(() => {
    if (storage) {
      return storage.getItem(name);
    }
    return null;
  }, [name, storage]);

  const handlePersistValues = useCallback(
    (values: FormikValues) => {
      if (storage) {
        storage.setItem(name, JSON.stringify(values));
        Object.keys(storage).forEach(key => {
          if (key.indexOf(keyName) > -1 && key !== name) {
            storage.removeItem(key);
          }
        });
      }
    },
    [storage]
  );

  return [state, handlePersistValues];
};

const PersistFormikValuesMemo: FC<PersistFormikValuesProps> = props => {
  const { debounce = 300, persistInvalid, ignoreValues } = props;
  const { values, setValues, isValid, initialValues } = useFormikContext<any>();
  const [persistedString, persistValues] = usePersistedString(props);
  const stringValues = JSON.stringify(values);

  const handlePersist = useCallback(() => {
    if (isValid || persistInvalid) {
      const valuesToPersist = ignoreValues
        ? omit(values, ignoreValues)
        : values;
      persistValues(valuesToPersist);
    }
  }, [stringValues, isValid, persistInvalid]);

  useEffect(() => {
    if (persistedString) {
      // Catches invalid json
      try {
        const persistedValues = JSON.parse(persistedString);
        const newValues = { ...initialValues, ...persistedValues };
        // Initial values should be merged with persisted
        if (stringValues !== JSON.stringify(newValues)) {
          setValues(newValues);
        }
      } catch (error) {
        console.error('Parse persisted values is not possible', error);
      }
    }
  }, [persistedString]);

  useDebounce(handlePersist, debounce, [stringValues, isValid, persistInvalid]);

  return null;
};

export const PersistFormikValues = memo(PersistFormikValuesMemo);
