const express = require("express");
const menusRouter = express.Router({ mergeParams: true });
const menuItemsRouter = require("./menuItems");
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database(
  process.env.TEST_DATABASE || "./database.sqlite"
);

//GET
menusRouter.get("/", (req, res, next) => {
  const sql = `SELECT * FROM Menu`;
  db.all(sql, (err, menus) => {
    if (err) {
      next(err);
    } else {
      res.send({ menus: menus });
    }
  });
});

menusRouter.post("/", (req, res, next) => {
  const menu = req.body.menu;
  const title = menu.title;
  if (!title) {
    return res.status(400).send();
  }

  const values = { $title: title };
  const insertSql = `INSERT INTO Menu (title) VALUES ($title)`;

  db.run(insertSql, values, function(err) {
    if (err) return next(err);

    const lastMenuSql = `SELECT * FROM Menu WHERE id = ${this.lastID}`;
    db.get(lastMenuSql, (err, menu) => {
      if (err) return next(err);

      if (menu) return res.status(201).send({ menu: menu });
    });
  });
});

menusRouter.param("menuId", (req, res, next, menuId) => {
  const sql = `SELECT * FROM Menu WHERE id = $menuId`;
  const values = { $menuId: menuId };

  // find menu from db
  db.get(sql, values, (err, menu) => {
    if (err) {
      next(err);
    } else if (!menu) {
      res.status(404).send();
    } else {
      req.menu = menu;
      next();
    }
  });
});

menusRouter.get("/:menuId", (req, res, next) => {
  res.send({ menu: req.menu });
});

// PUT
// Updates the menu with the specified menu ID using the information from the menu property of the request body and saves it to the database. Returns a 200 response with the updated menu on the menu property of the response body
// If any required fields are missing, returns a 400 response
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response

menusRouter.put("/:menuId", (req, res, next) => {
  const menuId = req.params.menuId;
  const title = req.body.menu.title;

  if (!title) {
    return res.status(400).send();
  }

  const updateSql = `UPDATE Menu SET title = $title WHERE id = $menuId`;
  const values = { $menuId: menuId, $title: title };

  db.run(updateSql, values, function(err) {
    if (err) return next(err);

    const getMenuSql = `SELECT * FROM Menu WHERE id = ${menuId}`;

    db.get(getMenuSql, (err, menu) => {
      if (err) return next(err);

      res.send({ menu: menu });
    });
  });
});

// DELETE
// Deletes the menu with the supplied menu ID from the database if that menu has no related menu items. Returns a 204 response.
// If the menu with the supplied menu ID has related menu items, returns a 400 response.
// If a menu with the supplied menu ID doesn’t exist, returns a 404 response
menusRouter.delete("/:menuId", (req, res, next) => {
  const menuId = req.params.menuId;
  const sql = `SELECT * FROM MenuItem WHERE menu_id = $menuId`;
  const values = { $menuId: menuId };

  db.get(sql, values, (err, menuItem) => {
    if (err) {
      next(err);
    } else if (!menuItem) {
      // delete menu from db
      const deleteSql = `DELETE FROM Menu WHERE id = ${menuId}`;

      db.run(deleteSql, err => {
        if (err) {
          next(err);
        } else {
          res.status(204).send();
        }
      });
    } else {
      res.status(400).send();
    }
  });
});

menusRouter.use("/:menuId/menu-items", menuItemsRouter);
module.exports = menusRouter;
