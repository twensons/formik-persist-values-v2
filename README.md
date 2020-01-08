# Formik Persist

Persist and rehydrate a [Formik](https://github.com/jaredpalmer/formik) form.

```
npm install formik-persist-values --save
```

# Basic Usage

Just import the `<Persist >` component and put it inside any Formik form. It renders `null`!

```js
import React from 'react';
import { Formik, Field, Form } from 'formik';
import { Persist } from 'formik-persist-fork';

export const Signup = () => (
  <div>
    <h1>My Cool Persisted Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
      render={props => (
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
          <Persist name="signup-form" />
        </Form>
      )}
    />
  </div>
);
```

### Props

- `name: string`: LocalStorage key to save form state to
- `debounce:? number`: Default is `300`. Number of ms to debounce the function that saves form state.
- `isSessionStorage:? boolean`: default is `false` . Send if you want Session storage inplace of Local storage
- `persistInvalid:? boolean`: default is `false` . Persist if you want save invalid values

## Author

- Grigoriy Kolenko [@kolengri](https://twitter.com/kolengri)

## Inspired by

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- [formik-persist](https://github.com/jaredpalmer/formik-persist)

## Todo

- Alternative storages (localForage)
- Support AsyncStorage for React Native
