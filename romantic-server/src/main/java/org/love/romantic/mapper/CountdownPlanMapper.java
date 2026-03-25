package org.love.romantic.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.love.romantic.entity.CountdownPlan;

/**
 * 共享见面倒计时计划 Mapper。
 */
@Mapper
public interface CountdownPlanMapper extends BaseMapper<CountdownPlan> {
}
