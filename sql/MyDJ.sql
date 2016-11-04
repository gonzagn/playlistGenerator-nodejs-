-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Servidor: localhost:3306
-- Tiempo de generación: 04-11-2016 a las 13:15:27
-- Versión del servidor: 5.5.42
-- Versión de PHP: 5.6.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `MyDJ`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partys`
--

CREATE TABLE `partys` (
  `token` varchar(35) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `idUser` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `partys`
--

INSERT INTO `partys` (`token`, `nombre`, `idUser`) VALUES
('3np4rt6jgeklnmi', 'teh2ht', 19),
('55fv9wxi8hl7hkt9', 'Gente', 17),
('6s1zbi352zp30udi', 'Halloween', 15),
('a00ot1o0kxdsfw29', 'Despedida Chini', 11),
('aj8rhwm5copnl8fr', 'ig', 21),
('c5g9acgnc79qw7b9', 'Paolo', 13),
('clzzee4v681zia4i', 'Paolo', 16),
('k93sby4oqen4s4i', 'Halloween', 10),
('kh0btmu6q7p919k9', 'wtrht', 20),
('s7fpn3wpivmcmcxr', 'Halloween', 14),
('utpai37gory66r', 'ojbwngrourn', 12),
('xx02bxqudddeu3di', 'Pruebas', 18);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `partys_usuarios`
--

CREATE TABLE `partys_usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `idSpotify` varchar(255) NOT NULL,
  `tokenParty` varchar(35) DEFAULT NULL,
  `anfitrion` int(11) DEFAULT '0'
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `partys_usuarios`
--

INSERT INTO `partys_usuarios` (`id`, `nombre`, `idSpotify`, `tokenParty`, `anfitrion`) VALUES
(10, 'Gonzalo', '######## ANFITRION #######', 'k93sby4oqen4s4i', 1),
(11, 'Paula', '######## ANFITRION #######', 'a00ot1o0kxdsfw29', 1),
(12, 'wgrreg', '######## ANFITRION #######', 'utpai37gory66r', 1),
(13, 'Paco', '######## ANFITRION #######', 'c5g9acgnc79qw7b9', 1),
(14, 'Gonzalo Y Angelica', '######## ANFITRION #######', 's7fpn3wpivmcmcxr', 1),
(15, 'Paolo', '######## ANFITRION #######', '6s1zbi352zp30udi', 1),
(16, 'ekfnewr', '######## ANFITRION #######', 'clzzee4v681zia4i', 1),
(17, 'Po', '######## ANFITRION #######', '55fv9wxi8hl7hkt9', 1),
(18, 'jegpo', '######## ANFITRION #######', 'xx02bxqudddeu3di', 1),
(19, 'Htr', '######## ANFITRION #######', '3np4rt6jgeklnmi', 1),
(20, 'hrtwh', '######## ANFITRION #######', 'kh0btmu6q7p919k9', 1),
(21, 'iuhouh', '######## ANFITRION #######', 'aj8rhwm5copnl8fr', 1);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `partys`
--
ALTER TABLE `partys`
  ADD PRIMARY KEY (`token`);

--
-- Indices de la tabla `partys_usuarios`
--
ALTER TABLE `partys_usuarios`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `partys_usuarios`
--
ALTER TABLE `partys_usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=22;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
