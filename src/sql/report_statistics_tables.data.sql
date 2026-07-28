
insert ignore into report_statistics_tables (id,table_template) 

values 
(md5('blg_pos_{tabellenzusatz}'),'blg_pos_{tabellenzusatz}'),
(md5('blg_hdr_{tabellenzusatz}'),'blg_hdr_{tabellenzusatz}'),
(md5('lg_{BLGTABELLE}_{tabellenzusatz}'),'lg_{BLGTABELLE}_{tabellenzusatz}'),
(md5('{DSTABELLE}'),'{DSTABELLE}'),
(md5('artikelgruppen'),'artikelgruppen'),
(md5('warengruppen'),'warengruppen'),
(md5('blg_config'),'blg_config');