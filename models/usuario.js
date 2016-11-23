var connection = require('../connection');

function Usuario() {

    this.get = function(res) {
        connection.acquire(function(err, con) {
            con.query('SELECT * FROM usuarios', function(err, result) {
                con.release();
                res.send(result);
            });
        });
    };

    this.create = function(usuario, res) {
        connection.acquire(function(err, con) {
            con.query('INSERT INTO usuarios set ?', usuario, function(err, result) {
                con.release();
                if (err) {
                    res.send({status: 1, message: 'Usuario creation failed'});
                } else {
                    res.send({status: 0, message: 'Usuario created successfully'});
                }
            });
        });
    };

    this.update = function(usuario, res) {
        connection.acquire(function(err, con) {
            con.query('UPDATE usuarios set ? where id = ?', [usuario, usuario.id], function(err, result) {
                con.release();
                if (err) {
                    res.send({status: 1, message: 'Usuario update failed'});
                } else {
                    res.send({status: 0, message: 'Usuario updated successfully'});
                }
            });
        });
    };

    this.delete = function(id, res) {
        connection.acquire(function(err, con) {
            con.query('DETELE FROM usuarios where id = ?', [id], function(err, result) {
                con.release();
                if (err) {
                    res.send({status: 1, message: 'Failed to delete Usuario'});
                } else {
                    res.send({status: 0, message: 'Deleted successfully Usuario'});
                }
            });
        });
    };
}
module.exports = new Usuario();