import { useState, useEffect } from 'react';

function useFetch(url, options = {}, skip = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip) return;

    setLoading(true);
    fetch(url, options)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url, skip]);

  return { data, loading, error };
}

export default useFetch;
