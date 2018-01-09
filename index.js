const _request = require( 'request' );
const crypto = require( 'crypto' );

function SinopiaRequest( config, sinopia ) {

    var base_options = {
        method: config.method,
        header: {
            'Content-Type': 'application/json',
            'User-Agent': sinopia.config.user_agent
        }
    };

    var encrypt;
    switch ( config.password_encrypt ) {
        default:
            encrypt = function ( str ) {
                return str;
            };
    }

    console.log('sinopia-request plugin loaded.');

    var request = function ( user, password, route, callback ) {

        var options = base_options;
        options.url = (sinopia.config.https.enable ? 'https' : 'http') + '://' + config.host + (config.port ? ':' + config.port : '') + route + '?username=' + user + '&password=' + password;

        _request( options, function ( err, res, body ) {

            if ( err ) {
                err.status = 500;
                return callback( err );
            }
            else if ( body === undefined ) {
                err = new Error( 'Bad server response.' );
                err.status = 500;
                return callback( err );
            }
            else{

                var result = JSON.parse(body);

                if(result.username === undefined){
                    err = new Error( result.message );
                    err.status = 500;
                    return callback( err );
                }else{
                    return callback( null, body );
                }

            }

        } );

    };

    this.adduser = function ( user, password, callback ) {
        err = new Error( 'Add user is not allowed!' );
        err.status = 500;
        return callback( err );
    };

    this.authenticate = function ( user, password, callback ) {
        request( user, encrypt( password ), config.authenticate_route, function ( err, res ) {
            if ( err )
                return callback( err );
            else if ( !res )
                return callback( null, false );
            else
                return callback( null, user );
        } );
    };

}

module.exports = function ( config, stuff ) {
    return new SinopiaRequest( config, stuff );
};