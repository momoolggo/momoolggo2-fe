import { ref } from 'vue'

const alertRef = ref(null)

export function setAlertRef(refValue) {
  alertRef.value = refValue
}

export async function showAlert(message, options = {}) {
  if (alertRef.value) {
    return await alertRef.value.show(message, options)
  }
  window.alert(message)
}

export async function showConfirm(message, options = {}) {
  if (alertRef.value) {
    return await alertRef.value.confirm(message, options)
  }
  return window.confirm(message)
}