import { useState } from 'react';

// Reused by both the create and edit pages.
export default function PostForm({ initialValues, onSubmit, submitLabel }) {
  const [values, setValues] = useState({
    title: initialValues?.title || '',
    content: initialValues?.content || '',
  });
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      {error && <p className="error">{error}</p>}
      <label>
        Title
        <input name="title" value={values.title} onChange={handleChange} required />
      </label>
      <label>
        Content
        <textarea
          name="content"
          value={values.content}
          onChange={handleChange}
          rows={10}
          required
        />
      </label>
      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
