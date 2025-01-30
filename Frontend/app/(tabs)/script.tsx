import * as tf from '@tensorflow/tfjs';

export const organizeRoutes = async (routes) => {
  if (!routes || routes.length === 0) return null; // Handle empty input early

  // Set the TensorFlow backend to CPU
  await tf.setBackend('cpu'); 
  await tf.ready(); 
   /*
  Resources
  https://www.tensorflow.org/guide/keras/sequential_model
  */
  // Initialize the model

  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [3], units: 10, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 5, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 1, activation: 'linear' })); // Use linear for regression

  // Compile the model
  /* Resources
  https://www.geeksforgeeks.org/adam-optimizer/
  */

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

  // Prepare the inputs
  const inputs = tf.tensor2d(
    routes.map(route => [
      Number(route.duration) || 0, 
      Number(route.transfers) || 0, 
      Number(route.modes) || 0 
    ])
  );

  const labels = tf.tensor2d(
    routes.map(route => [Number(route.priority) || 0])
  );

  // Train the model
  await model.fit(inputs, labels, { epochs: 10, batchSize: 8, shuffle: true });

  // Make predictions
  const predictions = await model.predict(inputs).array();

  // Attach the scores to the original routes
  const scoredRoutes = routes.map((route, index) => ({
    ...route,
    score: predictions[index][0] // Ensure prediction is read correctly
  }));

  // Sort by score in descending order (best route at index 0)
  scoredRoutes.sort((a, b) => b.score - a.score);

  // Return only the best route
  return scoredRoutes[0] || null; // Return the best route or null if no routes
};
