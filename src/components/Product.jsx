import React, { useState, useEffect } from 'react';
import './Product.css';

const ProductCard = ({ product, priorityMapping }) => {
  const priorityDescription = priorityMapping[product.priority];

  return (
    <div className="product-card">
      <div className="product-details">
        <div className="id">{product.id}</div>
        <div className="title-tag">
          <p>{product.title}</p>
          <p>Tag: {product.tag.join(', ')}</p>
          <p>Priority: {priorityDescription}</p>
        </div>
      </div>
      <div className="profile-icon">P</div>
    </div>
  );
};

const Product = () => {
  const [product, getProduct] = useState([]);
  const [grouping, setGrouping] = useState('status');
  const [sorting, setSorting] = useState('priority');
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [users, setUsers] = useState({});

  // Priority mapping for descriptions
  const priorityMapping = {
    0: 'No priority',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Urgent',
  };

  useEffect(() => {
    fetch('https://api.quicksell.co/v1/internal/frontend-assignment')
      .then((data) => data.json())
      .then((result) => {
        getProduct(result.tickets);
        const usersData = result.users.reduce((userMap, user) => {
          userMap[user.id] = user.name;
          return userMap;
        }, {});
        setUsers(usersData);
      });
  }, []);

  const toggleOptions = () => {
    setOptionsVisible(!isOptionsVisible);
  };

  const handleGroupingChange = (e) => {
    setGrouping(e.target.value);
  };

  const handleSortingChange = (e) => {
    setSorting(e.target.value);
  };

  const getGroupedAndSortedTickets = () => {
    let groupedAndSortedTickets = [...product];

    // Grouping logic
    if (grouping === 'status') {
      // Group by status
      groupedAndSortedTickets.sort((a, b) => a.status.localeCompare(b.status));
    } else if (grouping === 'user') {
      // Group by user
      groupedAndSortedTickets.sort((a, b) => a.userId.localeCompare(b.userId));
    } else if (grouping === 'priority') {
      // Group by priority
      groupedAndSortedTickets.sort((a, b) => b.priority - a.priority);
    }

    // Sorting logic
    if (sorting === 'priority') {
      // Sort by priority
      groupedAndSortedTickets.sort((a, b) => b.priority - a.priority);
    } else if (sorting === 'title') {
      // Sort by title
      groupedAndSortedTickets.sort((a, b) => a.title.localeCompare(b.title));
    }

    return groupedAndSortedTickets;
  };

  const groupedAndSortedTickets = getGroupedAndSortedTickets();

  // Group the tickets by selected grouping
  const groupedTickets = groupedAndSortedTickets.reduce((grouped, ticket) => {
    let groupingKey;
    if (grouping === 'user') {
      groupingKey = users[ticket.userId];
    } else {
      groupingKey = ticket[grouping];
    }

    if (!grouped[groupingKey]) {
      grouped[groupingKey] = [];
    }
    grouped[groupingKey].push(ticket);
    return grouped;
  }, {});

  // Create separate columns for each grouping
  const columns = Object.keys(groupedTickets).map((groupingKey) => {
    const cards = groupedTickets[groupingKey].map((ticket) => (
      <ProductCard key={ticket.id} product={ticket} priorityMapping={priorityMapping} />
    ));

    return (
      <div key={groupingKey} className="column">
        <h2>{grouping === 'user' ? groupingKey : `${grouping} ${groupingKey} (${cards.length})`}</h2>
        {cards}
      </div>
    );
  });

  return (
    <div>
      <div className="display-button">
        <button onClick={toggleOptions}>
          Display
        </button>
      </div>
      {isOptionsVisible && (
        <div className="options">
          <div>
            <label>Grouping:</label>
            <select value={grouping} onChange={handleGroupingChange}>
              <option value="status">Status</option>
              <option value="user">User</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <div>
            <label>Ordering:</label>
            <select value={sorting} onChange={handleSortingChange}>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      )}
      <div className="product-list">
        {columns}
      </div>
    </div>
  );
};

export default Product;
