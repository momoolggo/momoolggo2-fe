import { ref } from 'vue'

export function useAdminModal() {
  const alertShow = ref(false)
  const alertMsg = ref('')

  const showAlert = (msg) => {
    alertMsg.value = msg
    alertShow.value = true
  }
  const closeAlert = () => {
    alertShow.value = false
    alertMsg.value = ''
  }

  const confirmShow = ref(false)
  const confirmMsg = ref('')
  let _resolve = null

  const showConfirm = (msg) => {
    confirmMsg.value = msg
    confirmShow.value = true
    return new Promise((resolve) => { _resolve = resolve })
  }
  const onConfirmOk = () => {
    confirmShow.value = false
    _resolve?.(true)
    _resolve = null
  }
  const onConfirmCancel = () => {
    confirmShow.value = false
    _resolve?.(false)
    _resolve = null
  }

  return {
    alertShow, alertMsg, showAlert, closeAlert,
    confirmShow, confirmMsg, showConfirm, onConfirmOk, onConfirmCancel,
  }
}
