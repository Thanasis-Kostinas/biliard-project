// import React from "react";
// import { Link } from "react-router-dom";
// import { useGameContext } from "./GameContext";
// import "./Categories.css";

// const Categories: React.FC = () => {
//   const { categories } = useGameContext();

//   return (
//     <div className="categories-container">
//       <h1>Game Categories</h1>
//       <Link to="/create-category" className="button">Create New Category</Link>
//       <table>
//         <thead>
//           <tr>
//             <th>Category Name</th>
//             <th>Number of Instances</th>
//             <th>Total Revenue (€)</th>
//             <th>Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {categories.map((category) => (
//             <tr key={category.id}>
//               <td>{category.name}</td>
//               <td>{category.instances.length}</td>
//               <td>{category.instances.reduce((acc, instance) => acc + instance.totalCost, 0).toFixed(2)}</td>
//               <td>
//                 <Link to={`/instances/${category.id}`} className="button">Manage Instances</Link>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default Categories;
