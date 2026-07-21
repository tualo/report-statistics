CREATE TABLE IF NOT EXISTS `rn_statistik_configs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `datetype` varchar(255) DEFAULT NULL,
  `datefrom` varchar(255) DEFAULT NULL,
  `dateuntil` varchar(255) DEFAULT NULL,
  `description` varchar(400) DEFAULT NULL,
  `tz` varchar(4000) DEFAULT 'dr',
  PRIMARY KEY (`id`)
) ;


CREATE TABLE IF NOT EXISTS `rn_statistik_confs` (
  `id` int(11) NOT NULL,
  `rid` int(11) NOT NULL,
  `type` varchar(255) NOT NULL,
  `page` int(11) NOT NULL,
  `data` varchar(4000) DEFAULT NULL,
  PRIMARY KEY (`id`),
    KEY `idx_rn_statistik_confs_rid` (`rid`),
    CONSTRAINT `fk_rn_statistik_confs_rid` FOREIGN KEY (`rid`) 
    REFERENCES `rn_statistik_configs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ;