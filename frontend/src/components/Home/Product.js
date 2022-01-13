import React, { useState } from 'react';
import { Link } from "react-router-dom";
import Rating from '@mui/material/Rating';


const Product = ({ product }) => {
      
      const [value, setValue] = useState(product.ratings);


      return (
            <Link className='productCard' to={product._id}>
                  <img src={product.images[0].url} alt={product.name} />
                  <p>{product.name}</p>
                  <div>
                        <Rating
                              name="simple-controlled"
                              precision={0.5}
                              readOnly
                              size= {window.innerWidth < 600 ? 'medium' : 'small'}
                              value={value}
                              onChange={(event, newValue) => {
                                    setValue(newValue);
                              }}
                        />
                        <span> ({product.numOfReviews} Reviews)</span>
                  </div>
                  <span>₹{product.price}</span>
                  
                  
         </Link>
      )
}

export default Product
