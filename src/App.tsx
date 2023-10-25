import React, { useState } from 'react';
import { Form, Input, Select, Button, message } from 'antd';
import './App.css'

const { Option } = Select;

interface Plan {
  age_list: number[];
  sum_insured: number;
  city_tier: string;
  tenure: number;
  premium: number;
}

const App: React.FC = () => {
  const [form] = Form.useForm();
  const [premium, setPremium] = useState<number | null>(null);
  const [cart, setCart] = useState<Plan[]>([]);

  const handleCalculatePremium = async () => {
    try {
      const values = await form.validateFields();
      const { ages, sumInsured, cityTier, tenure } = values;

      // Validate ages in age_list
      const ageList = ages.split(',').map(Number);
      const isAgesValid = ageList.every((age: number) => age <= 65);

      if (!isAgesValid) {
        message.error('Ages must be between 18 and 65.');
        return;
      }

      // Prepare the data to send to the server
      const data = {
        age_list: ageList,
        sum_insured: sumInsured, // Fixed variable name
        city_tier: cityTier, // Fixed variable name
        tenure,
      };

      // Make an API request to your backend
      const response = await fetch('https://health-plan-apis.onrender.com/calculate_premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data from the server.');
      }

      const result = await response.json();

      setPremium(result.total_premium);

      // Add the selected plan to the cart
      setCart([
        ...cart,
        {
          age_list: ageList,
          sum_insured: sumInsured, // Fixed variable name
          city_tier: cityTier, // Fixed variable name
          tenure,
          premium: result.total_premium,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      message.error('Error calculating premium. Please try again later.');
    }
  };

  const handleRemoveFromCart = (index: number) => {
    // Remove a plan from the cart
    const updatedCart = [...cart];
    updatedCart.splice(index, 1);
    setCart(updatedCart);
  };

  const handleCheckout = () => {
    // You can implement your checkout logic here
    // For now, we'll just display a confirmation message
    const totalAmountPayable = calculateTotalAmountPayable();
    message.success(`Checkout: Total Amount Payable: $${totalAmountPayable}`);
  };

  const calculateTotalAmountPayable = () => {
    return cart.reduce((total, item) => total + item.premium, 0);
  };

  return (
    <div style={{ textAlign: 'center'}}>
      <h1>Insurance Premium Calculator</h1>
      <div>
        <h2>Calculate Premium</h2>
        <Form form={form} layout="vertical">
          <Form.Item
            label="Ages (comma-separated, e.g., 25,35,40)"
            name="ages"
            rules={[
              {
                required: true,
                message: 'Please enter ages!',
              },
            ]} 
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Sum Insured"
            name="sumInsured" // Fixed variable name
            rules={[
              {
                required: true,
                message: 'Please select sum insured!',
              },
            ]}
          >
            <Select>
              <Option value={300000}>300,000</Option>
              <Option value={400000}>400,000</Option>
              <Option value={500000}>500,000</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="City Tier"
            name="cityTier" // Fixed variable name
            rules={[
              {
                required: true,
                message: 'Please select city tier!',
              },
            ]}
          >
            <Select>
              <Option value="tier-1">Tier 1</Option>
              <Option value="tier-2">Tier 2</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Tenure"
            name="tenure"
            rules={[
              {
                required: true,
                message: 'Please select tenure!',
              },
            ]}
          >
            <Select>
              <Option value={1}>1 year</Option>
              <Option value={2}>2 years</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleCalculatePremium}>
              Calculate Premium
            </Button>
          </Form.Item>
        </Form>
        {premium !== null && <p>Premium: $ {premium}</p>}
      </div>
      <div>
        <h2>Cart</h2>
        <div className="cart">
          {cart.map((item, index) => (
            <div className="cart-item" key={index}>
              <p>
                <strong>Ages:</strong> {item.age_list.join(', ')}
              </p>
              <p>
                <strong>Sum Insured:</strong> ${item.sum_insured}
              </p>
              <p>
                <strong>City Tier:</strong> {item.city_tier}
              </p>
              <p>
                <strong>Tenure:</strong> {item.tenure} year(s)
              </p>
              <p>
                <strong>Premium:</strong> ${item.premium}
              </p>
              <Button style={{backgroundColor: 'red', color: 'white'}} onClick={() => handleRemoveFromCart(index)}>Remove</Button>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
           <div className="cart-summary">
            <p>Total Amount Payable: $ {calculateTotalAmountPayable()}</p>
            <Button type="primary" onClick={handleCheckout}>
              Checkout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
