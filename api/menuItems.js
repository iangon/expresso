const express = require("express");
const menuItems = express.Router({ mergeParams: true });
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//GET
menuItems.get("/", (req, res, next) => {
  const sql = `SELECT * FROM MenuItem WHERE menu_id = ${req.params.menuId}`;
  db.all(sql, (err, menuItems) => {
    if (err) {
      next(err);
    } else {
      res.send({ menuItems: menuItems });
    }
  });
});

menuItems.post("/", (req, res, next) => {
  const menuItem = req.body.menuItem;
  const { name, description, inventory, price } = menuItem;

  if (!name || !inventory || !price) {
    return res.status(400).send();
  }

  const values = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menu_id: req.params.menuId
  };

  const insertSql = `INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menu_id)`;

  db.run(insertSql, values, function(err) {
    if (err) return next(err);

    const lastMenuSql = `SELECT * FROM MenuItem WHERE id = ${this.lastID}`;
    db.get(lastMenuSql, (err, menuItem) => {
      if (err) return next(err);

      if (menuItem) return res.status(201).send({ menuItem: menuItem });
    });
  });
});

menuItems.param("menuItemId", (req, res, next, menuItemId) => {
  const sql = `SELECT * FROM MenuItem WHERE id = $menuItemId`;
  const values = { $menuItemId: menuItemId };

  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (!menuItem) {
      res.status(404).send();
    } else {
      req.menuItem = menuItem;
      next();
    }
  });
});

// PUT
// Updates the menu with the specified menu ID using the information from the menu property of the request body and saves it to the database. Returns a 200 response with the updated menu on the menu property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response

menuItems.put("/:menuItemId", (req, res, next) => {
  const menuItemId = req.params.menuItemId;
  const { name, description, inventory, price } = req.body.menuItem;

  if (!name || !inventory || !price) {
    return res.status(400).send();
  }

  const updateSql = `UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price WHERE id = $menuItemId`;
  const values = {
    $menuItemId: menuItemId,
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price
  };

  db.run(updateSql, values, function(err) {
    if (err) return next(err);

    const getMenuSql = `SELECT * FROM MenuItem WHERE id = ${menuItemId}`;

    db.get(getMenuSql, (err, menuItem) => {
      if (err) return next(err);

      res.send({ menuItem: menuItem });
    });
  });
});

// DELETE
// Deletes the menu item with the supplied menu item ID from the database. Returns a 204 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
// If a menu item with the supplied menu item ID doesn’t exist, returns a 404 response
menuItems.delete("/:menuItemId", (req, res, next) => {
  const menuItemId = req.params.menuItemId;

  // delete menu from db
  const deleteSql = `DELETE FROM MenuItem WHERE id = ${menuItemId}`;

  db.run(deleteSql, err => {
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    }
  });
});

module.exports = menuItems;
