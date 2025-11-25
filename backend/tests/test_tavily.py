from src.tools.tavily import tavily_tool
import json
import sys

def test_tool():
    """
    测试tavily工具并正确显示中文内容。
    
    解决中文显示问题的几种方法：
    1. 使用 json.dumps(ensure_ascii=False) 正确序列化
    2. 设置终端编码支持UTF-8
    3. 使用 pprint 美化输出
    """
    tool = tavily_tool
    query = "HiQLCD"
    response = tool.web_search_using_tavily(query,max_results=5)
    
    # 如果返回的是字符串，先解析
    if isinstance(response, str):
        try:
            response_dict = json.loads(response)
        except json.JSONDecodeError:
            response_dict = {"raw_response": response}
    else:
        response_dict = response
    # 确保response_dict是字典类型
    if not isinstance(response_dict, dict):
        response_dict = {"response": response_dict}

        print("\n== 完整JSON输出 ===")
    print(json.dumps(response_dict, ensure_ascii=False, indent=2))
    
    return response_dict

if __name__ == "__main__":
    # 确保终端支持UTF-8输出
    if sys.platform.startswith('win'):
        # Windows系统特殊处理
        import os
        os.system('chcp 65001 >nul')
    
    test_tool()
