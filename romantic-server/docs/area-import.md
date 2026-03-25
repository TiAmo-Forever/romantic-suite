# 行政区数据导入说明

## 推荐数据源

- `AreaCity-JsSpider-StatsGov`
- 仓库地址：<https://github.com/xiangyuecn/AreaCity-JsSpider-StatsGov>

该仓库提供全国省市区行政区划数据，适合导入 `basic_area` 表后由后端统一查询。

## 导入建议

1. 从数据源仓库下载最新的省市区数据文件。
2. 将数据整理为与 `basic_area` 一致的字段结构：
   - `id`
   - `level`
   - `parent_id`
   - `zip_code`
   - `city_code`
   - `name`
   - `short_name`
   - `merger_name`
   - `pinyin`
   - `loc_lng`
   - `loc_lat`
3. 使用 MySQL 的导入工具或脚本导入到 `basic_area`。

## 示例

可以先执行：

```sql
TRUNCATE TABLE basic_area;
```

然后用你本地整理好的 CSV 执行导入。建议导入后验证：

```sql
SELECT COUNT(*) FROM basic_area;
SELECT * FROM basic_area WHERE level = 0 LIMIT 10;
SELECT * FROM basic_area WHERE parent_id = 110000 LIMIT 10;
```
