const { Sequelize, Model, DataTypes, QueryTypes } = require("sequelize");
const { serialize, unserialize } = require("serialize-php");
const _ = require("underscore");
const config = require("./config.json");
const op = require("object-path");

const sequelize = new Sequelize(config.db);

const wpTableName = (suffix = "", blog_id = 1) => {
  return `wp${blog_id === 1 ? "" : `_${blog_id}`}_${suffix}`;
};

const getPostOptions = async () => {
  const options = {};
  const postTypes = config.post_types.map(pt => `"${pt}"`).join(",");
  for (const [locale, blog_id] of Object.entries(config.blogs)) {
    options[locale] = {};
    const query = `SELECT ID, post_type, post_title FROM ${wpTableName(
      "posts",
      blog_id
    )} WHERE post_type IN (${postTypes})`;
    const [posts] = await sequelize.query(query);
    options[locale].posts = _.indexBy(posts, "ID");
  }

  return options;
};

const saveOption = async (blog_id, option_name = "", option_value = "") => {
  const [options] = await sequelize.query(
    `SELECT * from ${wpTableName(
      "options",
      blog_id
    )} where option_name="${option_name}"`
  );
  // update
  if (options.length === 1) {
    const [option] = options;
    await sequelize.query(
      `UPDATE ${wpTableName(
        "options",
        blog_id
      )} SET option_value='${option_value}' where option_id="${
        option.option_id
      }"`
    );
    // insert
  } else {
    await sequelize.query(
      `INSERT INTO ${wpTableName(
        "options",
        blog_id
      )} (option_name, option_value) VALUES ("${option_name}", '${option_value}')`
    );
  }
};

const savePostOptions = async postOptions => {
  // console.log({postOptions});
  for (const [locale, blog_id] of Object.entries(config.blogs)) {
    const { posts } = postOptions[locale];
    const others = Object.entries(config.blogs).filter(
      ([, bid]) => bid !== blog_id
    );

    for (const [post_id, post] of Object.entries(posts)) {
      const option_name = `msls_${post_id}`;
      const option_value = others.reduce((option, [locale, blog_id]) => {
        if (op.has(postOptions, [locale, "posts", post_id])) {
          op.set(option, [locale], post.ID);
        }

        return option;
      }, {});

      await saveOption(blog_id, option_name, serialize(option_value));
    }
  }
};

const getTermOptions = async () => {
  const options = {};
  for (const [locale, blog_id] of Object.entries(config.blogs)) {
    options[locale] = {};
    const query = `SELECT * FROM ${wpTableName("terms", blog_id)}`;
    const [terms] = await sequelize.query(query);
    options[locale].terms = _.indexBy(terms, "term_id");
  }

  return options;
};

const saveTermOptions = async termOptions => {
  for (const [locale, blog_id] of Object.entries(config.blogs)) {
    const { terms } = termOptions[locale];
    const others = Object.entries(config.blogs).filter(
      ([, bid]) => bid !== blog_id
    );

    for (const [term_id, term] of Object.entries(terms)) {
      const option_name = `msls_term_${term_id}`;
      const option_value = others.reduce((option, [locale, blog_id]) => {
        if (op.has(termOptions, [locale, "terms", term_id])) {
          op.set(option, [locale], term.term_id);
        }

        return option;
      }, {});

      await saveOption(blog_id, option_name, serialize(option_value));
    }
  }
};

const run = async () => {
  try {
    const postOptions = await getPostOptions();
    await savePostOptions(postOptions);

    const termOptions = await getTermOptions();
    await saveTermOptions(termOptions);
  } catch (error) {
    console.error({ error });
  }
};

run();
