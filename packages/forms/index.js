/**
 * @simplijs/forms
 * Professional form handling with validation and wizards.
 */

export function createForm(initialData, options = {}) {
  const {
    validation = {},
    autoSave = false,
    storageKey = 'simpli_form_draft'
  } = options;

  // Retrieve reactive and effect
  const { reactive, watch } = window.Simpli || {};
  if (!reactive) throw new Error('SimpliJS not found.');

  const form = reactive({
    data: initialData,
    errors: {},
    isSubmitting: false,
    isValid: true,
    step: 1
  });

  // Load draft
  if (autoSave && typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        Object.assign(form.data, JSON.parse(saved));
      } catch (e) {}
    }

    // Watch for changes to auto-save
    watch(() => form.data, (newData) => {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }, { deep: true });
  }

  function validateField(field, value) {
    const rules = validation[field];
    if (!rules) return null;

    if (rules.required && !value) return 'This field is required';
    if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    if (rules.min && value.length < rules.min) return `Minimum length is ${rules.min}`;
    if (rules.pattern && !rules.pattern.test(value)) return 'Invalid format';
    
    return null;
  }

  form.validate = () => {
    let isValid = true;
    form.errors = {};
    for (const field in validation) {
      const error = validateField(field, form.data[field]);
      if (error) {
        form.errors[field] = error;
        isValid = false;
      }
    }
    form.isValid = isValid;
    return isValid;
  };

  form.submit = async (callback) => {
    if (!form.validate()) return;
    form.isSubmitting = true;
    try {
      await callback(form.data);
      if (autoSave) localStorage.removeItem(storageKey);
    } catch (e) {
      form.errors.submit = e.message;
    } finally {
      form.isSubmitting = false;
    }
  };

  form.nextStep = () => form.step++;
  form.prevStep = () => form.step > 1 && form.step--;

  return form;
}
