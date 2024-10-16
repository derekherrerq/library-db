import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setCount(count - 1);
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Fun Counter!</h1>
      <h2>{count}</h2>
      <button onClick={increment} style={{ marginRight: '10px' }}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

export default Counter;
