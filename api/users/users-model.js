const db = require('../../data/dbConfig');

function findUsername(username) {
    return db('users').select('username', 'password').where('username', username).first()
}

function findById(user_id) {
    return db('users').select('id', 'username', 'password').where('id', user_id).first()
}

async function add({ username, password }) {
    let created_user_id
    await db.transaction(async trx => {
        const [user_id] = await trx('users').insert({ username, password })
        created_user_id = user_id
    })
    return findById(created_user_id)
}

module.exports = {
    findUsername,
    findById,
    add
}