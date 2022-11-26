
image_array = [
  '1.png',
  '2.png',
  '3.png',
  '4.png',
  '5.png',
  '6.png',
  '7.png',
  '8.png',
  '9.png',
  '10.png',
  '11.png',
  '12.png',
  '13.png',
  '14.png',
  '15.png',
  '16.png',
  '17.png',
  '18.png',
  '19.png',
  '20.png',
  '21.png',
  '22.png',
  '23.png',
  '24.png'
]

function get_random_image(){

  random_index = Math.floor(Math.random() * image_array.length);

  selected_image = image_array[random_index]

  document.getElementById('image_shower').src = `./img/${selected_image}`
}

