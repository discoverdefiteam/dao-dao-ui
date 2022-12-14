import { Toaster } from 'react-hot-toast'

import { ErrorToast, LoadingToast, SuccessToast } from '@dao-dao/ui'

export const Notifications = () => (
  <Toaster
    position="top-center"
    reverseOrder={false}
    toastOptions={{
      duration: 6000,
      // Show for entire duration of promise.
      loading: {
        duration: Infinity,
      },
      style: {
        borderRadius: '0',
        background: 'none',
        color: '#fff',
        boxShadow: 'none',
      },
    }}
  >
    {(t) =>
      t.type === 'error' ? (
        <ErrorToast toast={t} />
      ) : t.type === 'loading' ? (
        <LoadingToast toast={t} />
      ) : (
        <SuccessToast toast={t} />
      )
    }
  </Toaster>
)
